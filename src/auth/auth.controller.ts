import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthLoginDto } from './dto/auth.login.dto';
import { AuthSignUpDto } from './dto/auth.sign-up.dto';
import { IResponse } from 'src/utils/response/response.interface';
import { UserDocument } from 'src/user/user.schema';
import { AuthLoginSerialization } from './auth.login.serialization';
import { DebuggerService } from 'src/debugger/debugger.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { IUserCheckExist, IUserCreate } from 'src/user/user.interface';
import { LoggerService } from 'src/logger/logger.service';
import { ENUM_LOGGER_ACTION } from 'src/logger/logger.constant';
import { MailService } from '../mail/mail.service';

@Controller({
  version: '1',
  path: '/auth',
})
export class AuthController {
  constructor(
    private readonly debuggerService: DebuggerService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
    private readonly mailService: MailService,
  ) {}

  @Response('auth.login', 1001)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() body: AuthLoginDto): Promise<IResponse> {
    const user: UserDocument = await this.userService.findOne<UserDocument>({
      email: body.email,
    });

    if (!user) {
      this.debuggerService.error(
        'Authorized error user not found',
        'AuthController',
        'login',
      );

      throw new NotFoundException({
        statusCode: 400,
        message: 'user.error.notFound',
      });
    }

    const validate: boolean = await this.authService.validateUser(
      body.password,
      user.password,
    );

    if (!validate) {
      throw new BadRequestException({
        statusCode: 401,
        message: 'auth.error.passwordNotMatch',
      });
    } else if (!user.isActive) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'user.error.inactive',
      });
    }

    const safe: AuthLoginSerialization =
      await this.authService.serializationLogin(user);

    const payloadAccessToken: Record<string, any> =
      await this.authService.createPayloadAccessToken(safe);

    const accessToken: string = await this.authService.createAccessToken(
      payloadAccessToken,
    );

    await this.loggerService.info({
      action: ENUM_LOGGER_ACTION.LOGIN,
      description: `${user._id} do login`,
      user: user._id,
      tags: ['login', 'withEmail'],
    });

    return {
      accessToken,
    };
  }

  @Response('auth.signUp', 1002)
  @Post('/sign-up')
  async signUp(
    @Body() { email, mobileNumber, ...body }: AuthSignUpDto,
  ): Promise<IResponse> {
    const checkExist: IUserCheckExist = await this.userService.checkExist(
      email,
      mobileNumber,
    );

    if (checkExist.email || checkExist.mobileNumber) {
      throw new BadRequestException({
        statusCode: 403,
        message: 'user.error.exist',
      });
    }

    try {
      const password = await this.authService.createPassword(body.password);

      const create = await this.userService.create({
        firstName: body.firstName,
        lastName: body.lastName,
        email,
        mobileNumber,
        password: password.passwordHash,
      } as IUserCreate);

      const user: UserDocument =
        await this.userService.findOneById<UserDocument>(create._id);
      const safe: AuthLoginSerialization =
        await this.authService.serializationLogin(user);

      const payloadAccessToken: Record<string, any> =
        await this.authService.createPayloadAccessToken(safe);

      const accessToken: string = await this.authService.createAccessToken(
        payloadAccessToken,
      );

      await this.mailService.sendUserConfirmation(user, accessToken);

      return {};
    } catch (err: any) {
      this.debuggerService.error(
        'Signup try catch',
        'AuthController',
        'signUp',
        err,
      );

      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'http.serverError.internalServerError',
      });
    }
  }
}
