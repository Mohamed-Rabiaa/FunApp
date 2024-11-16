import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * AuthService is responsible for managing JWT authentication operations.
 *
 * Provides functionality for validating and generating JWT tokens.
 */
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    /**
     * Validates a given JWT token.
     *
     * This method attempts to verify the provided token. If the token is invalid or expired, it will throw an UnauthorizedException.
     *
     * @param {string} token - The JWT token to be validated.
     * @throws {UnauthorizedException} If the token is invalid or expired.
     * @return {any} The decoded token payload if the token is valid.
     */
    @ApiOperation({ summary: 'Validate JWT Token' })
    @ApiResponse({ status: 200, description: 'Token is valid', type: String })
    @ApiResponse({ status: 401, description: 'Invalid or expired token' })
    validateToken(token: string): any {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    /**
     * Generates a new JWT token based on the provided payload.
     *
     * This method signs the payload with a secret key, and the token will expire in 1 hour.
     *
     * @param {any} payload - The payload to be included in the JWT token (typically includes user-related information like `sub`, `email`).
     * @throws {Error} If the token generation process encounters an issue (e.g., missing secret key).
     * @return {Promise<string>} The signed JWT token.
     */
    @ApiOperation({ summary: 'Generate JWT Token' })
    @ApiResponse({ status: 201, description: 'Token generated successfully', type: String })
    async generateToken(payload: any): Promise<string> {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET_KEY'),
            expiresIn: '1h',
        });
    }
}
