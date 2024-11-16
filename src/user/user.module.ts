import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LocationHelper } from '../shared/helpers/location.helper';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService, LocationHelper, AuthService, JwtService],
    controllers: [UserController],
})
export class UserModule {}
