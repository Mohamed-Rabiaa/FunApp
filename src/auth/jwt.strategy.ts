import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

/**
 * JwtStrategy is a Passport strategy that handles JWT authentication for incoming requests.
 *
 * It extracts the token from the Authorization header, verifies it using the secret key,
 * and validates the payload to ensure the user is authenticated.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * JwtStrategy constructor.
     *
     * This constructor initializes the Passport strategy with configuration values.
     *
     * @param {ConfigService} configService - ConfigService used to access environment variables for JWT secret.
     */
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
        });
    }

    /**
     * Validates the JWT payload and returns the user data.
     *
     * This method extracts the user information from the payload (e.g., `sub` for user ID and `email`),
     * which is used to attach the user to the request object.
     *
     * @param {any} payload - The decoded JWT payload, which contains the user data (e.g., user ID, email).
     * @return {object} An object containing the `userId` and `email` from the payload.
     */
    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}
