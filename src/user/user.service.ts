import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { EmailService } from 'src/email/email.service';
import { generateUniqueValue } from 'src/shared';

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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, body: UpdateUser) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
