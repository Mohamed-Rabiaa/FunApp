import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthService } from '../auth/auth.service';
import { LocationHelper } from '../shared/helpers/location.helper';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepositoryMock: any;
  let authServiceMock: any;
  let locationHelperMock: any;

  beforeEach(async () => {
    userRepositoryMock = { findOneBy: jest.fn(), save: jest.fn() };
    authServiceMock = { generateToken: jest.fn() };
    locationHelperMock = { isWithinEgypt: jest.fn(), getCityByCordinates: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LocationHelper, useValue: locationHelperMock },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('addNewUser', () => {
    it('should create a new user and return a token', async () => {
      const createUserDto = {
        name: 'John Doe',       
        email: 'john@example.com',
        latitude: 30.0444,      
        longitude: 31.2357,     
      };

      const mockUser = { id: '1', ...createUserDto };
      const token = 'newJwtToken';
      userRepositoryMock.save.mockResolvedValue(mockUser);
      authServiceMock.generateToken.mockResolvedValue(token);
      locationHelperMock.isWithinEgypt.mockReturnValue(true);
      locationHelperMock.getCityByCordinates.mockResolvedValue('Cairo');

      const result = await userService.addNewUser(createUserDto);

      expect(result).toBe(token);
      expect(userRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
      expect(authServiceMock.generateToken).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });

    it('should throw ConflictException if the user already exists', async () => {
      const createUserDto = {
        name: 'John Doe',       
        email: 'existing@example.com',
        latitude: 30.0444,      
        longitude: 31.2357,   
      };

      userRepositoryMock.findOneBy.mockResolvedValue({ email: 'existing@example.com' });

      await expect(userService.addNewUser(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if user is not located in Egypt', async () => {
      const createUserDto = {
        name: 'John Doe',       
        email: 'john@example.com',
        latitude: 100,          // Invalid coordinates
        longitude: 100,         // Invalid coordinates
      };

      locationHelperMock.isWithinEgypt.mockReturnValue(false);

      await expect(userService.addNewUser(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserProfile', () => {
    it('should return a user profile', async () => {
      const userId = '1';
      const user = { id: '1', name: 'John Doe', email: 'john@example.com', city: 'Cairo' };
      userRepositoryMock.findOneBy.mockResolvedValue(user);

      const result = await userService.getUserProfile(userId);

      expect(result).toEqual({
        name: user.name,
        email: user.email,
        city: user.city,
      });
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const userId = 'nonExistentId';
      userRepositoryMock.findOneBy.mockResolvedValue(null);

      await expect(userService.getUserProfile(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
