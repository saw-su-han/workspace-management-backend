import { InvitePayload } from "./invitation.types.js";
import { transporter } from "../../../utils/mail.js";
import { prisma } from "../../../utils/prisma.js";
import { AppError } from "../../../errors/AppError.js";
import { generateInvitationToken } from "../../../utils/invitationToken.js";
import { CLIENT_URL } from "../../../config/env-var.js";

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

  const token = generateInvitationToken(email);

  const workSpaceExist = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
  });

  if (!workSpaceExist) {
    throw new AppError("Workspace not exist");
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
  const invitationLink = `${CLIENT_URL}/accept-invitation/${token}`;

  //  Send email

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Workspace Invitation",
    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Workspace Invitation</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <tr>
              <td style="background: linear-gradient(135deg, #059669, #0f766e); padding:28px 32px;">
                <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:-0.5px;">
                  Project<span style="color:#d1fae5;">Hive</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 12px; font-size:20px; color:#111827;">You're invited</h2>
                <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#4b5563;">
                  You've been invited to join a workspace on ProjectHive as
                  <strong>${role}</strong>. Accept the invitation below to get started.
                </p>
                <div style="text-align:center; margin:28px 0;">
                  <a href="${invitationLink}" style="display:inline-block; background-color:#059669; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:12px;">
                    Accept Invitation
                  </a>
                </div>
                <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:#6b7280;">
                  If you weren't expecting this invitation, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #f0f0f0;">
                <p style="margin:0; font-size:11px; color:#9ca3af; text-align:center;">
                  © ${new Date().getFullYear()} ProjectHive · Secure Corporate Provisioning
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `,
  });

  // console.log(info);
  // console.log("Invitation Link:", invitationLink);

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

//for fix in monday to add query to get members
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
    throw new AppError("You are not a workspace member of this workspace", 403);
  }
  // if (membership.role != "OWNER" && membership.role != "ADMIN") {
  //   throw new AppError("Only Owner or Admin can view members", 403);
  // }

  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    select: {
      userId: true,
      role: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return members.map((member) => ({
    workspaceId,
    userId: member.userId,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    status: "ACTIVE",
  }));
};

export const updateMemberRoleService = async (
  workspaceId: number,
  ownerId: number,
  targetId: number,
  newRole: "ADMIN" | "MEMBER",
) => {
  const ownerMembership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: ownerId,
    },
  });

  if (!ownerMembership || (ownerMembership.role !== "OWNER" && ownerMembership.role !== "ADMIN")) {
    throw new AppError("Only owner or admin can update member roles", 403);
  }

  if (ownerId === targetId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const targetMembership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetId,
      },
    },
  });

  if (!targetMembership) {
    throw new AppError("User is not a member of this workspace", 404);
  }

  if (targetMembership.role === "OWNER") {
    throw new AppError("Cannot change the owner's role", 403);
  }

  // Admins cannot change another admin's role — only the owner can
  if (ownerMembership.role === "ADMIN" && targetMembership.role === "ADMIN") {
    throw new AppError("Admins cannot change another admin's role", 403);
  }

  if (newRole === targetMembership.role) {
    throw new AppError("Cannot change role to same role", 400);
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