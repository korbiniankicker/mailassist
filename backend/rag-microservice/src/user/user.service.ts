import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UserDto } from '../common/dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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
}
