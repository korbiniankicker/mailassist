import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class HttpAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (!(type === 'Bearer')) {
      throw new HttpException('Missing bearer token', HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = await this.jwtService.verifyAsync(token) as { user_id: number; username: string };
      request['user'] = { id: payload.user_id, username: payload.username };
    } catch (err) {
      throw new HttpException(
        'Invalid or expired jwt token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return true;
  }
}
