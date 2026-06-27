import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_PASSWORD || 'arvello-default-secret-key-at-least-32-chars'
);

const ALGORITHM = 'HS256';

export async function encryptSession(payload: { role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d') // Session expires in 7 days
    .sign(JWT_SECRET);
}

export async function decryptSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [ALGORITHM],
    });
    return payload as { role: string };
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}
