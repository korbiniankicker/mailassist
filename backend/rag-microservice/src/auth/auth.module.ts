import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpAuthGuard } from './httpauth.guard';
import { WsAuthGuard } from './wsauth.guard';

@Module({
  imports: [UserService, JwtService],
  providers: [AuthService, HttpAuthGuard],
  controllers: [AuthController],
  exports: [HttpAuthGuard, WsAuthGuard],
})
export class AuthModule {}
