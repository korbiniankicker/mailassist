import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HttpAuthGuard } from '../auth/httpauth.guard';
import { UserService } from './user.service';
import { EmailCredentialsDto } from '../common/dto/email-credentials.dto';

@Controller('user')
@UseGuards(HttpAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('credentials')
  @HttpCode(HttpStatus.OK)
  async updateEmailCredentials(
    @Req() req: any,
    @Body() dto: EmailCredentialsDto,
  ) {
    return this.userService.updateEmailCredentials(req.user.id, dto);
  }
}
