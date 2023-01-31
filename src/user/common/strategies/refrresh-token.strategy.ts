import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_KEY } from 'src/shared/utils/consts.util';
import { IJwtPayload, IJwtPayloadWithRefreshToken } from '../interfaces';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_KEY,
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: IJwtPayload,
  ): Promise<IJwtPayloadWithRefreshToken> {
    const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      ?.trim();

    if (!refreshToken)
      throw new ForbiddenException('Access denied(Credentials)');

    return { ...payload, refreshToken };
  }
}
