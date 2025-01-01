export interface AuthJwtPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}
