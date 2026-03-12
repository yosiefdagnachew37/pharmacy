import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { username, password, role, manager_pin } = createUserDto;

        const existingUser = await this.usersRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt();
        const password_hash = await bcrypt.hash(password, salt);

        const user = this.usersRepository.create({
            username,
            password_hash,
            role,
            manager_pin,
        });

        return this.usersRepository.save(user);
    }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async verifyPin(pin: string): Promise<User | null> {
        // Find any user with roles ADMIN or PHARMACIST that has this PIN
        return this.usersRepository.findOne({
            where: [
                { manager_pin: pin, role: UserRole.ADMIN, is_active: true },
                { manager_pin: pin, role: UserRole.PHARMACIST, is_active: true }
            ]
        });
    }
}
