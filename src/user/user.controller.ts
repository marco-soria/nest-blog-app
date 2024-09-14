import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { GenericResponse } from '../shared/types';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './user.entity';
import { UserDTO } from './dto/user-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() body: CreateUser): Promise<GenericResponse> {
    await this.userService.createUser(body);
    return new GenericResponse('Please check your email');
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async handleUpdate(
    @Body() body: UpdateUser,
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<GenericResponse> {
    if (user.id !== +id) throw new ForbiddenException('Unauthorized');
    await this.userService.updateUser(user.id, body);
    return new GenericResponse('User is updated');
  }

  @Get(':handle')
  async getUser(@Param('handle') handle: string): Promise<UserDTO> {
    return this.userService.getUser(handle);
  }
}
