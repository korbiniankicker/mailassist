import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpAuthGuard } from './httpauth.guard';
import { WsAuthGuard } from './wsauth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [AuthService, HttpAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
