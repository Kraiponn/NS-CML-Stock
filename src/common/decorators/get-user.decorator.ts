import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayloadWithRefreshToken } from 'src/user/common/interfaces';

export const GetUser = createParamDecorator(
  (
    data: keyof IJwtPayloadWithRefreshToken | undefined,
    ctx: ExecutionContext,
  ) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!data) return user;

    return user[data];
  },
);
