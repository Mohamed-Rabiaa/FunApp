import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (ConfigService: ConfigService) => ({
                secret: ConfigService.get<string>('JWT_SECRET_KEY'),
                signOptions: {
                    expiresIn: ConfigService.get<string>('JWT_EXPIRATION', '1h'),
                },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})

export class AuthModule {}