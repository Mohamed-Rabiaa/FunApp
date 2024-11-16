import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserProfileDto } from './dtos/user-profile.dto';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userServiceMock: any;

  beforeEach(async () => {
    userServiceMock = { addNewUser: jest.fn(), getUserProfile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('addNewUser', () => {
    it('should successfully add a new user and return a token', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        latitude: 30.0444,
        longitude: 31.2357,
      };
      const token = 'jwtToken';
      userServiceMock.addNewUser.mockResolvedValue(token);

      const result = await userController.addNewUser(createUserDto);

      expect(result).toEqual({ success: true, message: 'User registered successfully', token });
    });

    it('should throw ConflictException if the user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        latitude: 30.0444,
        longitude: 31.2357,
      };
      const errorMessage = 'User already exists';
      userServiceMock.addNewUser.mockRejectedValue(new ConflictException(errorMessage));

      try {
        await userController.addNewUser(createUserDto);
      } catch (error) {
        expect(error.response.message).toBe(errorMessage);
        expect(error.status).toBe(409); // Conflict
      }
    });

    it('should throw BadRequestException if the user is not in Egypt', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        latitude: 0,
        longitude: 0,
      };
      const errorMessage = 'You must be located in Egypt to sign up';
      userServiceMock.addNewUser.mockRejectedValue(new BadRequestException(errorMessage));

      try {
        await userController.addNewUser(createUserDto);
      } catch (error) {
        expect(error.response.message).toBe(errorMessage);
        expect(error.status).toBe(400); // Bad Request
      }
    });
  });

  describe('getUserProfile', () => {
    it('should successfully retrieve user profile', async () => {
      const userId = '123';
      const userProfileDto: UserProfileDto = {
        name: 'John Doe',
        email: 'john@example.com',
        city: 'Cairo',
      };

      userServiceMock.getUserProfile.mockResolvedValue(userProfileDto);

      const result = await userController.getUserProfile(userId);

      expect(result).toEqual(userProfileDto);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '123';
      const errorMessage = "User doesn't exist";
      userServiceMock.getUserProfile.mockRejectedValue(new NotFoundException(errorMessage));

      try {
        await userController.getUserProfile(userId);
      } catch (error) {
        expect(error.response.message).toBe(errorMessage);
        expect(error.status).toBe(404); // Not Found
      }
    });
  });
});
