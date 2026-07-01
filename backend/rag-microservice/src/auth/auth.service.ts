import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserDto } from '../common/dto/user.dto';
import { UserService } from '../user/user.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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

  async loginUser(userDto: UserDto): Promise<string> {
    if (!userDto.password || !userDto.username) {
      throw new HttpException(
        'username and password must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const user = await this.userService.getUserByName(userDto.username);
      if (!user) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }

      if (await bcrypt.compare(userDto.password, user.hashedPassword)) {
        const payload = { user_id: user.id, username: user.username };
        return await this.jwtService.signAsync(payload);
      } else {
        throw new HttpException(
          'Authentication failed, password is incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        'Error fetching user information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
