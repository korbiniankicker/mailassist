import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../common/dto/user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async register(@Body() userDto: UserDto) {
    const token = await this.authService.registerUser(userDto);
    return JSON.stringify({
      token: token,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() userDto: UserDto) {
    const token = await this.authService.loginUser(userDto);
    return JSON.stringify({
      token: token,
    });
  }
}
