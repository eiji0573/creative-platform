import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** 認証任意ガード：トークンがなくてもエラーにならない */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest<TUser = any>(_err: any, user: any): TUser {
    return user ?? null;
  }
}
