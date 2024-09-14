import { Injectable } from '@nestjs/common';
import { AuthRequest } from './dto/auth-request.dto';
import { UserService } from '../user/user.service';
import { AuthUser } from './dto/auth-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { Repository } from 'typeorm';
import { generateUniqueValue } from '../shared';
import { LoginUser } from './dto/login-user.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
  ) {}

  async handleAuth(
    request: AuthRequest,
  ): Promise<{ user: AuthUser; token: string }> {
    const user = await this.userService.validateToken(
      request.operation,
      request.token,
    );

    const token = new Token();
    token.user = user;
    token.token = generateUniqueValue();

    await this.tokenRepository.save(token);

    const { id, name, email, handle, image } = user;
    return {
      user: { id, name, email, handle, image },
      token: token.token,
    };
  }

  async deleteToken(token: string | null): Promise<void> {
    await this.tokenRepository.delete({ token });
  }

  async handleLogin(request: LoginUser): Promise<void> {
    await this.userService.generateLoginToken(request.email);
  }

  async getUserFromToken(token: string): Promise<User | undefined> {
    const tokenInDB = await this.tokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
    if (!tokenInDB) return undefined;
    return tokenInDB.user;
  }
}
