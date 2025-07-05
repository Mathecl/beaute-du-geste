import { jwtVerify, SignJWT } from 'jose';

interface UserJwtPayload {
  jti: string; // jwt id
  iat: number;
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret || secret.length === 0) {
    throw new Error('The environment variable JWT_SECRET_KEY is not set');
  }

  return secret;
};

export const verifyAuth = async (token: string) => {
  try {
    // jwtVerify(token, key) comes from jose package (running on the Edge)
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey()),
    );

    return verified.payload as UserJwtPayload;
  } catch (error) {
    throw new Error('Your token has expired');
  }
};
