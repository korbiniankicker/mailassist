import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserDto } from '../common/dto/user.dto';
import { UserService } from '../user/user.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly userService: UserService) {}

  async registerUser(userDto: UserDto): Promise<number> {
    if (!userDto.password || !userDto.username) {
      throw new HttpException(
        'username and password must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    const saltRounds: number = process.env.SALT_ROUNDS
      ? Number(process.env.SALT_ROUNDS)
      : 10;
    const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

    try {
      const user = await this.userService.createUser(userDto);

      return HttpStatus.CREATED;
    } catch (err) {
      Logger.error(err);
      throw new HttpException(
        'Unable to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
