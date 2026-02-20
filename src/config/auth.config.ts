import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: StringValue;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '60m') as StringValue,
    },
  }),
);
