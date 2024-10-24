import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RegisterResponse } from './types/UserResponse.type';
import { AccessTokenPayload } from './types/AccessTokenPayload';
import { AccessToken } from './types/AccessToken';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    const isMatch: boolean = bcrypt.compareSync(pass, user.password);
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<AccessToken> {
    const payload: AccessTokenPayload = {
      username: user.username,
      sub: user.userId,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: CreateUserDto): Promise<RegisterResponse> {
    const existingUser = await this.usersService.findByUsername(user.username);
    if (existingUser) {
      throw new ConflictException('username already exists');
    }

    return await this.usersService.createUser(user);
  }
}
