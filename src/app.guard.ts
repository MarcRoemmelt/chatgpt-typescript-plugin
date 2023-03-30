import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { authorization } = request.headers;
    const verifyToken = this.configService.get('auth.chatgptToken');
    const bearerToken = authorization?.split(' ')[1];
    return bearerToken === verifyToken;
  }
}
