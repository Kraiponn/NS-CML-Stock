import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLE_KEY } from '../utils/consts.util';

export const Roles = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);
