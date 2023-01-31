import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../utils/consts.util';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
