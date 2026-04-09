import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export type JwtUser = {
  userId: string;
  email: string;
};

export function signToken(payload: JwtUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, JWT_SECRET) as JwtUser;
}
