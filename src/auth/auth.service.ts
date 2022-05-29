import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { UserDocument } from 'src/user/user.schema';
import { HelperEncryptionService } from 'src/utils/helpers/encryption.service';
import { HelperHashService } from 'src/utils/helpers/hash.service';
import { IAuthPassword } from './auth.interface';
import { AuthLoginDto } from './dto/auth.login.dto';
import { AuthLoginSerialization } from './auth.login.serialization';

@Injectable()
export class AuthService {
  private readonly accessTokenSecretToken: string;
  private readonly accessTokenExpirationTime: string;
  private readonly accessTokenNotBeforeExpirationTime: string;

  private readonly refreshTokenSecretToken: string;
  private readonly refreshTokenExpirationTime: string;
  private readonly refreshTokenExpirationTimeRememberMe: string;
  private readonly refreshTokenNotBeforeExpirationTime: string;

  constructor(
    private readonly helperHashService: HelperHashService,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecretToken = this.configService.get<string>(
      'auth.jwt.accessToken.secretKey',
    );
    this.accessTokenExpirationTime = this.configService.get<string>(
      'auth.jwt.accessToken.expirationTime',
    );
    this.accessTokenNotBeforeExpirationTime = this.configService.get<string>(
      'auth.jwt.accessToken.notBeforeExpirationTime',
    );

    this.refreshTokenSecretToken = this.configService.get<string>(
      'auth.jwt.refreshToken.secretKey',
    );
    this.refreshTokenExpirationTime = this.configService.get<string>(
      'auth.jwt.refreshToken.expirationTime',
    );
    this.refreshTokenExpirationTimeRememberMe = this.configService.get<string>(
      'auth.jwt.refreshToken.expirationTimeRememberMe',
    );
    this.refreshTokenNotBeforeExpirationTime = this.configService.get<string>(
      'auth.jwt.refreshToken.notBeforeExpirationTime',
    );
  }

  async createAccessToken(payload: Record<string, any>): Promise<string> {
    return this.helperEncryptionService.jwtEncrypt(payload, {
      secretKey: this.accessTokenSecretToken,
      expiredIn: this.accessTokenExpirationTime,
      notBefore: this.accessTokenNotBeforeExpirationTime,
    });
  }

  async validateUser(
    passwordString: string,
    passwordHash: string,
  ): Promise<boolean> {
    return this.helperHashService.bcryptCompare(passwordString, passwordHash);
  }

  async createPayloadAccessToken(
    data: AuthLoginDto,
  ): Promise<Record<string, any>> {
    return {
      ...data,
    };
  }

  async serializationLogin(
    data: UserDocument,
  ): Promise<AuthLoginSerialization> {
    return plainToInstance(AuthLoginSerialization, data);
  }

  async createPassword(password: string): Promise<IAuthPassword> {
    const saltLength: number = this.configService.get<number>(
      'auth.password.saltLength',
    );
    const salt: string = this.helperHashService.randomSalt(saltLength);

    const passwordHash = this.helperHashService.bcrypt(password, salt);
    return {
      passwordHash,
    };
  }
}
