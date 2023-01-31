import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from 'src/user/common/interfaces';

export const GetUserId = createParamDecorator(
  (_: undefined, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as IJwtPayload;

    return user.sub;
  },
);
