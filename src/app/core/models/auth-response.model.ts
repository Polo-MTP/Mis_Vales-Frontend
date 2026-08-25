import { User } from './user.model';
import { ApiErrorCode } from './api-error-code.model';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  /** Solo presente cuando success=false -- ver api-error-code.model.ts. */
  error_code?: ApiErrorCode;
}

export interface LoginResultData {
  user?: User;
  requires_mfa?: boolean;
  requires_email_otp?: boolean;
  requires_setup?: boolean;
  step?: number;
  mfa_method_id?: string;
  user_id?: number;
  setup_url?: string;
}

export interface MfaSetupData {
  email: string;
  secretKey: string;
  qrCodeUrl: string;
  qrSvg: string;
  mfa_method_id: string;
}
