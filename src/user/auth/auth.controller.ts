import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, GetUserId, Roles } from 'src/shared/decorators';
import {
  AccessTokenGuard,
  RefreshTokenGuard,
  RolesGuard,
} from 'src/shared/guards';
import { UserUpdateDTO, UserUpdatePwdDTO } from '../common/dtos';
import { UserResponseDTO } from '../common/dtos/response.dto';

import { ITokens, IUserRegister, IUserResponse } from '../common/interfaces';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /************************************************************************************
   * Description     Create or Register The New Member
   * Route           POST /api/auth/local/register
   * Access          Public
   */
  @Post('local/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: IUserRegister): Promise<any> {
    return await this.authService.register(dto);
  }

  /************************************************************************************
   * Description     Login to access the credentials
   * Route           POST /api/auth/local/login
   * Access          Public
   */
  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: IUserRegister) {
    return await this.authService.login(dto);
  }

  /************************************************************************************
   * Description     Logout
   * Route           POST /api/auth/logout
   * Access          Private
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async Logout(@GetUserId() userId: number): Promise<UserResponseDTO> {
    return await this.authService.logout(userId);
  }

  /************************************************************************************
   * Description     Find Account By User Id
   * Route           GET /api/auth/me
   * Access          Private
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async GetProfile(@GetUserId() userId: number): Promise<IUserResponse> {
    return await this.authService.findById(userId);
  }

  /************************************************************************************
   * Description     Get new tokens
   * Route           GET /api/auth/refresh-jwt
   * Access          Private
   */
  @UseGuards(RefreshTokenGuard, RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Get('refresh-token')
  @HttpCode(HttpStatus.OK)
  async getNewTokens(
    @GetUser('refreshToken') refreshToken: string,
    @GetUserId() userId: number,
  ): Promise<ITokens> {
    return await this.authService.resetToken(userId, refreshToken);
  }

  /************************************************************************************
   * Description     Update account
   * Route           PUT /api/auth/edit-account
   * Access          Private
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Put('edit-account')
  @HttpCode(HttpStatus.OK)
  async updateAccount(
    @GetUserId() userId: number,
    @Body() dto: UserUpdateDTO,
  ): Promise<UserResponseDTO> {
    return await this.authService.updateAccount(userId, dto);
  }

  /************************************************************************************
   * Description     Update password
   * Route           PUT /api/auth/edit-password
   * Access          Private
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN, Role.MANAGER)
  @Put('edit-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @GetUserId() userId: number,
    @Body() dto: UserUpdatePwdDTO,
  ): Promise<UserResponseDTO> {
    return await this.authService.updatePassword(userId, dto);
  }

  /************************************************************************************
   * Description     Remove an account
   * Route           DELETE /api/auth/remove-account
   * Access          Private
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN, Role.MANAGER)
  @Delete('remove-account')
  @HttpCode(HttpStatus.OK)
  async removeAccount(@GetUserId() userId: number): Promise<UserResponseDTO> {
    return await this.authService.removeAccount(userId);
  }
}
