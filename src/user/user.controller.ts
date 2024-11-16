import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserProfileDto } from './dtos/user-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

/**
 * UserController handles user-related operations such as signing up and retrieving user profiles.
 *
 * It provides endpoints to register a new user and fetch the profile data for an existing user
 * using JWT-based authentication.
 */
@ApiTags('Users') 
@Controller('user')
export class UserController {
    /**
     * UserController constructor.
     *
     * @param {UserService} userService - The service responsible for handling user operations.
     */
    constructor(private readonly userService: UserService) {}

    /**
     * Signs up a new user by accepting user registration details and returning a JWT token.
     *
     * This endpoint is used to create a new user, which involves registering them in the system 
     * and returning a token for authentication purposes.
     *
     * @param {CreateUserDto} createUserDto - The data transfer object containing the details of the user to be created.
     * @return {object} An object containing `success` (boolean), `message` (string), and the `token` (string) for the new user.
     */
    @Post('signup')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async addNewUser(@Body() createUserDto: CreateUserDto): Promise<{ success: boolean; message: string; token: string }> {
        const token = await this.userService.addNewUser(createUserDto);

        return { success: true, message: 'User registered successfully', token };
    }

    /**
     * Retrieves the profile of an existing user based on the provided user ID.
     * This endpoint is protected by the JWT authentication guard, ensuring that only authenticated users can access it.
     *
     * @param {string} id - The ID of the user whose profile is to be retrieved.
     * @return {UserProfileDto} The data transfer object containing the user profile details.
     * 
     * @throws {UnauthorizedException} If the request is made without a valid JWT token.
     */
    @UseGuards(JwtAuthGuard)
    @Get(':user_id')
    @ApiOperation({ summary: 'Get a user profile by ID' })
    @ApiBearerAuth()
    @ApiParam({ name: 'user_id', description: 'ID of the user to retrieve' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserProfileDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserProfile(@Param('user_id') id: string): Promise<UserProfileDto> {
        return await this.userService.getUserProfile(id);
    }
}

