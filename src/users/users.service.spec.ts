import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { User } from './users.entity';
import { Role } from '../auth/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

const baseUser: User = {
  id: 'uuid-1',
  name: 'Juan',
  lastName: 'Perez',
  email: 'juan@test.com',
  password: 'hashed',
  phone: '123',
  address: 'Calle 1',
  role: Role.VECINO,
  isActive: true,
  house: null,
  houseId: null,
  createdAt: new Date(),
};

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return users without passwords', async () => {
      mockRepo.find.mockResolvedValue([baseUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0].email).toBe(baseUser.email);
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return user without password when found', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);

      const result = await service.findOne('uuid-1');

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe('uuid-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: CreateUserDto = {
      name: 'Ana',
      lastName: 'Lopez',
      email: 'ana@test.com',
      password: 'secret',
      phone: '456',
      address: 'Calle 2',
      role: Role.VECINO,
    };

    it('should create a user and return without password', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepo.create.mockReturnValue({ ...baseUser, email: dto.email });
      mockRepo.save.mockResolvedValue({ ...baseUser, email: dto.email });

      const result = await service.create(dto, Role.ADMIN);

      expect(result).not.toHaveProperty('password');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);

      await expect(service.create(dto, Role.ADMIN)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException when non-SUPER_ADMIN tries to create an ADMIN', async () => {
      const adminDto: CreateUserDto = { ...dto, role: Role.ADMIN };

      await expect(service.create(adminDto, Role.ADMIN)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow SUPER_ADMIN to create an ADMIN', async () => {
      const adminDto: CreateUserDto = { ...dto, role: Role.ADMIN };
      mockRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepo.create.mockReturnValue({ ...baseUser, role: Role.ADMIN });
      mockRepo.save.mockResolvedValue({ ...baseUser, role: Role.ADMIN });

      const result = await service.create(adminDto, Role.SUPER_ADMIN);

      expect(result.role).toBe(Role.ADMIN);
    });

    it('should throw ConflictException when unique role already exists', async () => {
      const presidenteDto: CreateUserDto = { ...dto, role: Role.PRESIDENTE };
      // First findOne (email check) → null, second (ensureUniqueRole) → existing user
      mockRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(baseUser);

      await expect(
        service.create(presidenteDto, Role.SUPER_ADMIN),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('bad-id', {} as UpdateUserDto, Role.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-SUPER_ADMIN tries to set admin role', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);

      await expect(
        service.update('uuid-1', { role: Role.ADMIN }, Role.ADMIN),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when new email is already taken', async () => {
      const anotherUser = { ...baseUser, id: 'uuid-2', email: 'taken@test.com' };
      mockRepo.findOne
        .mockResolvedValueOnce(baseUser)     // find user to update
        .mockResolvedValueOnce(anotherUser); // email conflict check

      await expect(
        service.update('uuid-1', { email: 'taken@test.com' }, Role.ADMIN),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password when updating it', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');
      mockRepo.save.mockResolvedValue({ ...baseUser, password: 'new_hashed' });

      await service.update('uuid-1', { password: 'newpass' }, Role.ADMIN);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    });

    it('should update and return user without password', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);
      mockRepo.save.mockResolvedValue({ ...baseUser, name: 'Nuevo' });

      const result = await service.update('uuid-1', { name: 'Nuevo' }, Role.ADMIN);

      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe('Nuevo');
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should remove the user', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('uuid-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(baseUser);
    });
  });

  // ─── createSuperAdmin ─────────────────────────────────────────────────────────

  describe('createSuperAdmin', () => {
    it('should not create if email already exists', async () => {
      mockRepo.findOne.mockResolvedValue(baseUser);

      await service.createSuperAdmin('Super', 'Admin', 'juan@test.com', 'pass');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should create super admin when email does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepo.create.mockReturnValue({ ...baseUser, role: Role.SUPER_ADMIN });
      mockRepo.save.mockResolvedValue({ ...baseUser, role: Role.SUPER_ADMIN });

      await service.createSuperAdmin('Super', 'Admin', 'super@test.com', 'pass');

      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});
