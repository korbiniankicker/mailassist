import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../common/dto/user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() userDto: UserDto) {}

  @Post('/login')
  async login(@Body() userDto: UserDto) {}
}
