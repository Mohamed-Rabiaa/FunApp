import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserProfileDto } from './dtos/user-profile.dto';
import { LocationHelper } from '../shared/helpers/location.helper';
import { AuthService } from '../auth/auth.service';

/**
 * UserService handles the business logic related to user management, such as adding new users
 * and retrieving user profiles. It communicates with the database through the user repository
 * and integrates with location and authentication services.
 */
@Injectable()
export class UserService {
    /**
     * UserService constructor.
     * 
     * @param {Repository<User>} userRepository - The repository for interacting with the User entity.
     * @param {LocationHelper} locationHelper - Helper service to manage location-based logic (e.g., validating user location).
     * @param {AuthService} authService - Service to generate JWT tokens for authenticated users.
     */
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly locationHelper: LocationHelper,
        private readonly authService: AuthService,
    ) {}

    /**
     * Adds a new user to the system by validating their email and location, then generating a JWT token for authentication.
     *
     * This method will check if a user with the same email already exists. If not, it validates the user's location
     * (ensuring they are located within Egypt) and then creates a new user. Finally, it generates a JWT token for the user
     * and returns it.
     *
     * @param {CreateUserDto} createUserDto - The data transfer object containing the user's details.
     * @return {Promise<string>} A promise that resolves to a JWT token for the newly created user.
     * 
     * @throws {ConflictException} If a user with the same email already exists.
     * @throws {BadRequestException} If the user is not located in Egypt.
     */
    async addNewUser(createUserDto: CreateUserDto): Promise<string> {
        const { name, email, latitude, longitude } = createUserDto;

        // Check if the a user with the same email already exists
        const existingUser = await this.findOneBy('email', email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Validate location
        if (!this.locationHelper.isWithinEgypt(latitude, longitude)) {
            throw new BadRequestException('You must be located in Egypt to sign up');
        }

        // Get city and create user
        const city = await this.locationHelper.getCityByCordinates(latitude, longitude);
        const user: User = new User();
        user.name = name;
        user.email = email;
        user.latitude = latitude;
        user.longitude = longitude;
        user.city = city;

        const newUser = await this.userRepository.save(user);
        
        // Generate JWT token
        const token = this.authService.generateToken({ sub: newUser.id, email: newUser.email });
        return token;
    }

    /**
     * Retrieves the profile of an existing user by their user ID.
     *
     * This method checks if the user exists in the database by their ID. If the user does not exist,
     * it throws a `NotFoundException`. If the user exists, it returns a `UserProfileDto` containing
     * the user's name, email, and city.
     *
     * @param {string} id - The user ID to retrieve the profile for.
     * @return {Promise<UserProfileDto>} A promise that resolves to the user's profile information.
     * 
     * @throws {NotFoundException} If the user with the given ID does not exist.
     */
    async getUserProfile(id: string): Promise<UserProfileDto> {
        const user = await this.findOneBy('id', id);
        if (!user) {
            throw new NotFoundException('User doesn\'t exist');
        }

        // Map to UserProfileDto
        return {
            name: user.name,
            email: user.email,
            city: user.city,
        };
    }

    /**
     * Finds a user by a given field (email or ID).
     * 
     * This method is used to search for a user based on either their email or ID.
     *
     * @param {('email' | 'id')} field - The field to search by (either 'email' or 'id').
     * @param {string} value - The value of the field to search for.
     * @return {Promise<User | null>} A promise that resolves to the user if found, or null if no user is found.
     */
    async findOneBy(field: 'email' | 'id', value: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ [field]: value });
    }
}
