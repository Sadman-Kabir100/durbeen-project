export interface JwtPayload {
  sub: string; // user id
  phone: string;
  roles: string[]; // role slugs, RBAC guard-এ ব্যবহৃত হবে
}

export interface JwtRefreshPayload extends JwtPayload {
  tokenType: "refresh";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // সেকেন্ডে, access token-এর
}
