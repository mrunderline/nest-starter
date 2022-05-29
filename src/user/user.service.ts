import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { DatabaseEntity } from 'src/database/database.decorator';
import { UserDocument, UserEntity } from './user.schema';
import {
  IUserCheckExist,
  IUserCreate,
  IUserUpdate,
} from 'src/user/user.interface';

@Injectable()
export class UserService {
  constructor(
    @DatabaseEntity(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findOne<T>(find?: Record<string, any>): Promise<T> {
    const user = this.userModel.findOne(find);
    return user.lean();
  }

  async checkExist(
    email: string,
    mobileNumber: string,
    _id?: string,
  ): Promise<IUserCheckExist> {
    const existEmail: Record<string, any> = await this.userModel.exists({
      email: {
        $regex: new RegExp(email),
        $options: 'i',
      },
      _id: { $nin: [new Types.ObjectId(_id)] },
    });

    const existMobileNumber: Record<string, any> = await this.userModel.exists({
      mobileNumber,
      _id: { $nin: [new Types.ObjectId(_id)] },
    });

    return {
      email: !!existEmail,
      mobileNumber: !!existMobileNumber,
    };
  }

  async create({
    firstName,
    lastName,
    password,
    email,
    mobileNumber,
  }: IUserCreate): Promise<UserDocument> {
    const user: UserEntity = {
      firstName,
      email,
      mobileNumber,
      password,
      isActive: false,
      lastName: lastName || undefined,
    };

    const create: UserDocument = new this.userModel(user);
    return create.save();
  }

  async findOneById<T>(_id: string): Promise<T> {
    const user = this.userModel.findById(_id);
    return user.lean();
  }
}
