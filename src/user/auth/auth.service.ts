import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IJwtPayload,
  ITokens,
  IUserLogin,
  IUserRegister,
  IUserResponse,
} from '../common/interfaces';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { Role, User } from '@prisma/client';
import { UserResponseDTO } from '../common/dtos/response.dto';
import { UserUpdateDTO, UserUpdatePwdDTO } from '../common/dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /***************************************************************
   * Register The New Member
   */
  async register(dto: IUserRegister): Promise<ITokens> {
    const { name, email, password, phone } = dto;

    const emailExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (emailExist) throw new ConflictException('This an email already exists');

    const hash = await this.hashedData(password);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        hashedPassword: hash,
        phone,
      },
    });

    const { access_token, refresh_token } = await this.getTokens(
      user.id,
      email,
      user.role,
    );
    await this.updateRefreshTokenHash(user.id, refresh_token);

    return { access_token, refresh_token };
  }

  /***************************************************************
   * Login
   */
  async login(dto: IUserLogin): Promise<UserResponseDTO> {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('Account not found');

    const pwdMatches = await this.comparedData(password, user.hashedPassword);
    if (!pwdMatches) throw new BadRequestException("Password doesn't match");

    const { access_token, refresh_token } = await this.getTokens(
      user.id,
      email,
      user.role,
    );
    await this.updateRefreshTokenHash(user.id, refresh_token);
    delete user.hashedPassword;
    delete user.hashedRefreshToken;

    const tokens: ITokens = { access_token, refresh_token };

    return new UserResponseDTO({ ...user, tokens });
  }

  /***************************************************************
   *  Find Account By Id
   */
  async findById(userId: number): Promise<IUserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user)
      throw new NotFoundException(`User not found with id of ${userId}`);

    return this.filterUserResponse(user);
  }

  /***************************************************************
   *  Loged Out From Application
   */
  async logout(userId: number): Promise<UserResponseDTO> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    return new UserResponseDTO({
      message: 'Account logedout is successfully',
    });
  }

  /***************************************************************
   *  Get The New Refresh Token
   */
  async resetToken(userId: number, refreshToken: string): Promise<ITokens> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denies');

    const rtMatches = await this.comparedData(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!rtMatches) throw new ForbiddenException('Access Denies');

    const tokens = await this.getTokens(userId, user.email, user.role);
    await this.updateRefreshTokenHash(userId, tokens.refresh_token);

    return tokens;
  }

  /***************************************************************
   *  Update Password
   */
  async updatePassword(
    userId: number,
    dto: UserUpdatePwdDTO,
  ): Promise<UserResponseDTO> {
    const { currentPassword, newPassword } = dto;

    const userExist = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!userExist) throw new NotFoundException(`User not found`);

    const pwdMatches = await this.comparedData(
      currentPassword,
      userExist.hashedPassword,
    );

    if (!pwdMatches)
      throw new BadRequestException(`Current password is incollect`);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { hashedPassword: await this.hashedData(newPassword) },
    });

    return new UserResponseDTO({ message: 'Password is update' });
  }

  /***************************************************************
   *  Update account
   */
  async updateAccount(
    userId: number,
    dto: UserUpdateDTO,
  ): Promise<UserResponseDTO> {
    try {
      const foundUser = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!foundUser) throw new ForbiddenException('Access denied');

      const newUser = await this.prismaService.user.update({
        where: { id: userId },
        data: dto,
      });

      const fileterResult = this.filterUserResponse(newUser);

      return new UserResponseDTO({
        ...fileterResult,
      });
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }

  /***************************************************************
   *  Remove an account by id
   */
  async removeAccount(userId: number): Promise<UserResponseDTO> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException(`Account not found`);

    const result = await this.prismaService.user.delete({
      where: { id: userId },
    });

    if (!result) throw new BadRequestException(`Something went wrong`);

    return new UserResponseDTO({ message: 'Account removed successfully' });
  }

  //######################################################################################
  //                    >>>>>       HELPER METHOD       <<<<<
  //######################################################################################
  async hashedData(data: string): Promise<string> {
    // return await bcrypt.hash(data, 10);
    return await argon2.hash(data);
  }

  async comparedData(data: string, hashedData: string): Promise<boolean> {
    // return await bcrypt.compare(data, hashedData);
    return await argon2.verify(hashedData, data);
  }

  async getTokens(userId: number, email: string, role: Role): Promise<ITokens> {
    const payload: IJwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_KEY'),
        expiresIn: '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_KEY'),
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await this.hashedData(refreshToken);

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hash,
      },
    });
  }

  filterUserResponse(user: User): IUserResponse {
    const filterResult: IUserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return filterResult;
  }
}
