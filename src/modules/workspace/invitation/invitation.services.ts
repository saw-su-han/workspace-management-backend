import { InvitePayload } from "./invitation.types";
import { transporter } from "../../../utils/mail";
import { prisma } from "../../../utils/prisma";
import { AppError } from "../../../errors/AppError";
import { generateInvitationToken } from "../../../utils/invitationToken";
import { info } from "console";
import { id } from "zod/locales";
import { email } from "zod";
import { Role } from "../../../generated/prisma";

export const inviteUserService = async (
  workspaceId: number,
  invitedById: number,
  data: InvitePayload,
) => {
  const { email, role } = data;

  const inviterMembership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: invitedById,
    },
  });

  const log = await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: invitedById,
      action: `Invited ${email} to workspace`,
      entityType: "USER",
      entityId: 0,
    },
  });

  if (!inviterMembership) {
    throw new AppError("You are not a member of this workspace", 403);
  }

  // MEMBER cannot invite anyone
  if (inviterMembership.role === "MEMBER") {
    throw new AppError("Members cannot invite users", 403);
  }

  // ADMIN can only invite MEMBER
  if (inviterMembership.role === "ADMIN" && role !== "MEMBER") {
    throw new AppError("Admin can only invite members", 403);
  }

  // if (inviterMembership.role === "OWNER") {
  //   throw new AppError(
  //     "Owner role cannot be assigned or invited through invitation",
  //     403,
  //   );
  // }
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      workspaceId,
      email,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    throw new AppError(
      "User already has a pending invitation for this workspace",
      409,
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  //  Generate token FIRST
  const token = generateInvitationToken(email);

  const workSpaceExist = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
  });

  if (!workSpaceExist) {
    throw new AppError("Work space not exist");
  }

  //  Save invitation with token
  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      invitedById,
      invitedToId: existingUser?.id ?? null,
      email,
      role,
      token,
      status: "PENDING",
    },
  });

  //  Build link
  const invitationLink = `http://localhost:3000/api/invitations/accept/${token}`;

  //  Send email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Workspace Invitation",
    html: `
      <h2>Workspace Invitation</h2>
      <p>You have been invited as <b>${role}</b></p>
      <a href="${invitationLink}">Accept Invitation</a>
    `,
  });

  console.log("Invitation Link:", invitationLink);

  return invitation;
};

export const acceptInvitationService = async (token: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status === "ACCEPTED") {
    throw new Error("Invitation already accepted");
  }

  const user = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (!user) {
    return {
      needsSignup: true,
      redirect: "/signup",
      email: invitation.email,
      token,
    };
  }

  // accept invitation
  await prisma.invitation.update({
    where: { token },
    data: { status: "ACCEPTED" },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    },
    create: {
      workspaceId: invitation.workspaceId,
      userId: user.id,
      role: invitation.role,
    },
    update: {},
  });

  return {
    success: true,
    message: "Invitation accepted",
  };
};

export const getWorkSpaceMemberService = async (
  workspaceId: number,
  userId: number,
) => {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });
  if (!membership) {
    throw new AppError("Not a workspace member", 403);
  }
  if (membership.role != "OWNER" && membership.role != "ADMIN") {
    throw new AppError("Only Owner or Admin can view members", 403);
  }

  const members = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          workspaceId,
        },
      },
    },
    select: {
      name: true,
      email: true,
      memberships: {
        select: {
          role: true,
        },
      },
    },
  });
  return members.map((member) => ({
    name: member.name,
    email: member.email,
    role: member.memberships[0]?.role,
    status: "ACTIVE",
  }));
};

export const updateMemberRoleService = async (
  workspaceId: number,
  ownerId: number,
  targetId: number,
  newRole: "ADMIN" | "MEMBER" | "OWNER",
) => {
  //check
  const ownerMembership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: ownerId,
    },
  });

  if (!ownerMembership || ownerMembership.role != "OWNER") {
    throw new AppError("Only owner can update member role", 403);
  }

  if (ownerId === targetId) {
    throw new AppError("Owner cannot change own role");
  }

  if (newRole === "OWNER") {
    throw new AppError("Cannot assign Owner role");
  }

  const targetMembership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetId,
      },
    },
  });
  console.log({
    workspaceId,
    ownerId,
    targetId,
    newRole,
  });

  if (!targetMembership) {
    throw new AppError("User is not a member of this workspace", 404);
  }

  if (newRole === targetMembership.role) {
    throw new AppError("Cannot change role to same role");
  }

  await prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetId,
      },
    },
    data: {
      role: newRole,
    },
  });

  return { success: true, message: "Member role updated successfully" };
};
