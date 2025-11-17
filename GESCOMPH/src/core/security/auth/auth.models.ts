export interface AuthLoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorChallenge {
  email: string;
  expiresAt: string;
  expiresInSeconds: number;
  deliveryChannel: string;
}

export interface AuthLoginResponse {
  isSuccess: boolean;
  message: string;
  expiresAt?: string;
  requiresTwoFactor?: boolean;
  challenge?: TwoFactorChallenge;
}

export interface TwoFactorVerifyRequest {
  email: string;
  code: string;
}

export interface TwoFactorConfirmResponse {
  isSuccess: boolean;
  message: string;
  expiresAt: string;
}

export interface TwoFactorResendRequest {
  email: string;
}

export interface TwoFactorResendResponse {
  isSuccess: boolean;
  message: string;
  challenge: TwoFactorChallenge;
}
