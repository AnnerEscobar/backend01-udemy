import { IsEmail, MinLength } from "class-validator";

export class loginDto{

    @IsEmail()
    email: string;

    @MinLength(8)
    password:string;

}