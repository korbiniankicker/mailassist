import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UserDto } from '../common/dto/user.dto';
import { EmailCredentialsDto } from '../common/dto/email-credentials.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`user with id ${id} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getUserByName(usernameparam: string): Promise<User> {
    const res: User | null = await this.userRepo.findOne({
      where: { username: usernameparam },
    });
    if (!res) {
      this.logger.warn(`user with name ${usernameparam} not found`);
      throw new HttpException(
        `user with name ${usernameparam} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return res;
  }

  async createUser(createUserDto: UserDto) {
    if (!createUserDto.username) {
      throw new HttpException(
        'username cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!createUserDto.password) {
      throw new HttpException(
        'password cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser: User = {
      username: createUserDto.username,
      hashedPassword: createUserDto.password,
      imapHost: createUserDto.imapHost,
      imapPort: createUserDto.imapPort,
      imapUser: createUserDto.imapUser,
      imapPass: createUserDto.imapPass,
      imapSecure: createUserDto.imapSecure,
    } as User;

    try {
      const res = await this.userRepo.save(newUser);
      return res;
    } catch (err) {
      if (err instanceof QueryFailedError && err.driverError.code === '23505') {
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }
      this.logger.error(err);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateEmailCredentials(userId: number, dto: EmailCredentialsDto) {
    if (!dto.host || !dto.username || !dto.password) {
      throw new HttpException(
        'Email credentials must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.getUserById(userId);
    try {
      await this.userRepo.update(userId, {
        imapHost: dto.host,
        imapPort: dto.port,
        imapUser: dto.username,
        imapPass: dto.password,
        imapSecure: dto.secure ?? true,
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        'Failed to save email credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
