import crypto from "crypto";

export const generateInvitationToken = (email: string) => {
  return crypto.randomUUID();
};
