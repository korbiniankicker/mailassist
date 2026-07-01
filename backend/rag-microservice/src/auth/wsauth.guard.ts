import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token =
      client.handshake?.auth?.token ??
      client.handshake?.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new WsException('Missing bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
    } catch {
      throw new WsException('Invalid or expired jwt token');
    }

    return true;
  }
}
