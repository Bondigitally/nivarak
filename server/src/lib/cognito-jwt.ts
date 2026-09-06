import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config/index.js';

let accessTokenVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

export function getCognitoAccessTokenVerifier() {
  if (!accessTokenVerifier) {
    accessTokenVerifier = CognitoJwtVerifier.create({
      userPoolId: config.cognito.userPoolId,
      tokenUse: 'access',
      clientId: config.cognito.clientId,
    });
  }

  return accessTokenVerifier;
}

export type CognitoAccessTokenPayload = {
  sub: string;
  username?: string;
  'cognito:groups'?: string[];
  [key: string]: unknown;
};
