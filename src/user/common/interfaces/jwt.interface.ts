import { Role } from '@prisma/client';

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export interface IJwtPayload {
  sub: number;
  email: string;
  role: Role;
}

export interface IJwtPayloadWithRefreshToken extends IJwtPayload {
  refreshToken: string;
}
