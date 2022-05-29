import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class HelperHashService {
  constructor(private readonly configService: ConfigService) {}

  randomSalt(length?: number): string {
    return genSaltSync(
      length || this.configService.get<number>('helper.salt.length'),
    );
  }

  bcrypt(passwordString: string, salt: string): string {
    return hashSync(passwordString, salt);
  }

  bcryptCompare(passwordString: string, passwordHashed: string): boolean {
    return compareSync(passwordString, passwordHashed);
  }
}
