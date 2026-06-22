export interface RegisterFiles {
  logo?: Express.Multer.File[];
  avatar?: Express.Multer.File[];
}

export interface AccessTokenPayload {
  userId: number;
  workspaceId: number;
  role: string;
}

export interface RefreshTokenPayload {
  userId: number;
}
