import { IsString, IsEmail } from 'class-validator';

export class UserProfileDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    city: string;
}