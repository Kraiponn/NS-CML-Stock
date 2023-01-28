import { Role } from '@prisma/client';

export interface IUserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}
