import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';

export interface TOTPSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TOTPVerifyResult {
  isValid: boolean;
  usedBackupCode?: boolean;
}

/**
 * TOTP (Time-based One-Time Password) Service
 * Handles 2FA setup, verification, and backup codes
 */
export class TOTPService {
  private static readonly ISSUER = 'ECommerce Platform';
  private static readonly BACKUP_CODE_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Generate TOTP secret and QR code for setup
   */
  static async generateTOTPSecret(email: string): Promise<TOTPSetupData> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.ISSUER}:${email}`,
      issuer: this.ISSUER,
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token
   */
  static verifyTOTPToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time windows (30 seconds each)
    });
  }

  /**
   * Verify TOTP token or backup code
   */
  static verifyTOTPOrBackup(
    secret: string,
    token: string,
    storedBackupCodes: string[]
  ): TOTPVerifyResult {
    // First try TOTP token
    if (this.verifyTOTPToken(secret, token)) {
      return { isValid: true, usedBackupCode: false };
    }

    // Then try backup codes
    const backupCodeIndex = storedBackupCodes.indexOf(token);
    if (backupCodeIndex !== -1) {
      return { isValid: true, usedBackupCode: true };
    }

    return { isValid: false };
  }

  /**
   * Remove used backup code
   */
  static removeUsedBackupCode(backupCodes: string[], usedCode: string): string[] {
    return backupCodes.filter(code => code !== usedCode);
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Validate backup codes format
   */
  static validateBackupCodes(codes: string[]): boolean {
    if (!Array.isArray(codes) || codes.length !== this.BACKUP_CODE_COUNT) {
      return false;
    }

    return codes.every(code =>
      typeof code === 'string' &&
      code.length === this.BACKUP_CODE_LENGTH &&
      /^[A-F0-9]+$/.test(code)
    );
  }
}