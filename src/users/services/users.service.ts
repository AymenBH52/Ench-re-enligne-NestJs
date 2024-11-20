/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleEnum } from '../enums/enums';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // async create(createUserDto: CreateUserDto): Promise<User> {
  //   const newUser = this.userRepository.create(createUserDto);
  //   return this.userRepository.save(newUser);
  // }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: any): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }
  async getUser({ username, password }): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username, password },
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const updatedUser = Object.assign(user, dto);
    return this.userRepository.save(updatedUser);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const { password, profilePicture, role, ...rest } = createUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: hashedPassword,
        profilePicture: profilePicture || undefined,
      });

      const roleName = role || RoleEnum.USER;
      const userRole = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!userRole) {
        throw new InternalServerErrorException(`Role ${roleName} not found`);
      }
      user.role = userRole;

      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async addRolesToDb() {
    const roles = Object.values(RoleEnum);
    roles.forEach(async (role) => {
      const existingRole = await this.roleRepository.findOne({
        where: { name: role },
      });
      if (!existingRole) {
        const newRole = new Role();
        newRole.name = role;
        await this.roleRepository.save(newRole);
      }
    });
  }

  //**Update user profile picture**
  async updateUserProfilePicture(userId: string, imageUrl: string) {
    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
    });
    if (!user) {
      throw new Error('User not found');
    }
    user.profilePicture = imageUrl;
    await this.userRepository.save(user);
    return user;
  }
}
