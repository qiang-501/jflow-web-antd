import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles', 'roles.permissions'],
    });

    // Remove password from response
    data.forEach((user) => delete user.password);

    return { data, total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    delete user.password;
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Handle role associations
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      await this.usersRepository
        .createQueryBuilder()
        .relation(User, 'roles')
        .of(savedUser)
        .add(createUserDto.roleIds);
    }

    return this.findOne(savedUser.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    // Handle role associations
    if (updateUserDto.roleIds !== undefined) {
      await this.usersRepository
        .createQueryBuilder()
        .relation(User, 'roles')
        .of(user)
        .addAndRemove(
          updateUserDto.roleIds,
          user.roles.map((r) => r.id),
        );
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }
}
