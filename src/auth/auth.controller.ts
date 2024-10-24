/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

import { RegisterResponse } from './types/UserResponse.type';
import { LocalGuard } from './guards/local.guard';
import { JwtGuard } from './guards/jwt.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    // return this.authService.login(req.user);
    const jwt = await this.authService.login(req.user);
    res.cookie('jwt', jwt.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.send({ message: 'Login successful' });
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
 
  @Post('register')
  async register(
    @Body() registerBody: CreateUserDto,
  ): Promise<RegisterResponse> {
    return await this.authService.register(registerBody);
  }
}
