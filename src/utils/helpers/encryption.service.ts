import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IHelperJwtOptions } from './helper.interface';

@Injectable()
export class HelperEncryptionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  jwtEncrypt(
    payload: Record<string, any>,
    options?: IHelperJwtOptions,
  ): string {
    return this.jwtService.sign(payload, {
      secret:
        options && options.secretKey
          ? options.secretKey
          : this.configService.get<string>('helper.jwt.secretKey'),
      expiresIn:
        options && options.expiredIn
          ? options.expiredIn
          : this.configService.get<string>('helper.jwt.expirationTime'),
      notBefore:
        options && options.notBefore
          ? options.notBefore
          : this.configService.get<string>(
              'helper.jwt.notBeforeExpirationTime',
            ),
    });
  }
}
