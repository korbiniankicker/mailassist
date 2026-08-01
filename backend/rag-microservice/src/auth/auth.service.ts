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

  async registerUser(userDto: UserDto): Promise<string> {
    if (!userDto.password || !userDto.username) {
      throw new HttpException(
        'Username and password must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!userDto.imapHost || !userDto.imapUser || !userDto.imapPass) {
      throw new HttpException(
        'Email credentials (IMAP host, username and password) are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const saltRounds: number = process.env.SALT_ROUNDS
      ? Number(process.env.SALT_ROUNDS)
      : 10;
    const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

    const user = await this.userService.createUser({
      username: userDto.username,
      password: hashedPassword,
      imapHost: userDto.imapHost,
      imapPort: userDto.imapPort,
      imapUser: userDto.imapUser,
      imapPass: userDto.imapPass,
      imapSecure: userDto.imapSecure,
    });

    const payload = { user_id: user.id, username: user.username };
    return await this.jwtService.signAsync(payload);
  }

  async loginUser(userDto: UserDto): Promise<string> {
    if (!userDto.password || !userDto.username) {
      throw new HttpException(
        'Username and password must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const user = await this.userService.getUserByName(userDto.username);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (await bcrypt.compare(userDto.password, user.hashedPassword)) {
        if (userDto.imapHost && userDto.imapUser && userDto.imapPass) {
          await this.userService.updateEmailCredentials(user.id, {
            host: userDto.imapHost,
            port: userDto.imapPort ?? user.imapPort ?? 993,
            username: userDto.imapUser,
            password: userDto.imapPass,
            secure: userDto.imapSecure ?? user.imapSecure ?? true,
          });
        }
        const payload = { user_id: user.id, username: user.username };
        return await this.jwtService.signAsync(payload);
      } else {
        throw new HttpException(
          'Authentication failed, password is incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(err);
      throw new HttpException(
        'Error fetching user information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
