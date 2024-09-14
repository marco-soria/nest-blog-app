import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { EmailService } from 'src/email/email.service';
import { generateUniqueValue, Operation } from 'src/shared';
import { UserDTO } from './dto/user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private dataSource: DataSource,
  ) {}

  async createUser(body: CreateUser): Promise<void> {
    const user = new User();
    user.email = body.email;
    user.name = body.email.split('@')[0];
    user.handle = user.name;

    const userInDB = await this.userRepository.findOneBy({
      handle: user.handle,
    });
    if (userInDB) {
      user.handle = user.name + generateUniqueValue(true);
    }

    user.registrationToken = generateUniqueValue();

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(user);
      await this.emailService.sendSignUpEmail(
        user.email,
        user.registrationToken,
      );
      await queryRunner.commitTransaction();
    } catch (exception) {
      if (exception.message.includes('UNIQUE constraint')) {
        throw new BadRequestException('Invalid request', {
          cause: [{ property: 'email', constraints: ['Email is in use'] }],
        });
      }
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException('Server error');
    }
  }

  async validateToken(operation: Operation, token: string): Promise<User> {
    const where: FindOptionsWhere<User> = {};
    if (operation === Operation.register) {
      where.registrationToken = token;
    } else {
      where.loginToken = token;
    }
    const user = await this.userRepository.findOneBy(where);
    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    if (operation === Operation.register) {
      user.registrationToken = null;
    } else {
      user.loginToken = null;
    }
    this.userRepository.save(user);
    return user;
  }

  async generateLoginToken(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.loginToken = generateUniqueValue();

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(user);
      await this.emailService.sendLoginEmail(user.email, user.loginToken);
      await queryRunner.commitTransaction();
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException('Server error');
    }
  }

  async updateUser(id: number, body: UpdateUser) {
    const user = await this.userRepository.findOneBy({ id });
    user.name = body.name;
    user.image = body.image;
    await this.userRepository.save(user);
  }

  async getUser(handle: string): Promise<UserDTO> {
    const user = await this.userRepository.findOneBy({ handle });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserDTO(user);
  }
}
