
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import {CreateUserDto, loginDto, RegisterUserDto, UpdateAuthDto } from './dto'

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }


  async create(createUserDto: CreateUserDto): Promise<User> {
    try {

      const { password, ...userData } = createUserDto;

      //-Encriptar contrasenia
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();

      return user;

    } catch (error) {
      console.log(error.code);

      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} This email aready exist`!);
      }
      throw new InternalServerErrorException('Something terrible happened!!!!')
    }
  }

  async login(loginDto: loginDto):Promise<LoginResponse> {

    const { email, password } = loginDto; 
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email ')
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password ')
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({id: user.id}),
    }

  }

  async register(RegisterDto: RegisterUserDto):Promise<LoginResponse>{

    const user = await this.create(RegisterDto);
    console.log(user)
    return{
      user: user,
      token: this.getJwtToken({id: user._id})
    }
  }


  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}