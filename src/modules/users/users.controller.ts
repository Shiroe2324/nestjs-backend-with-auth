import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { User } from '@/decorators/user.decorator';
import { User as UserEntity } from '@/entities/user.entity';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { FindAllDto } from '@/modules/users/dto/find-all.dto';
import { MeDto } from '@/modules/users/dto/me.dto';
import { UpdateDto } from '@/modules/users/dto/update.dto';
import { UserDto } from '@/modules/users/dto/user.dto';
import { UsersService } from '@/modules/users/users.service';
import { ParseImageFilePipe } from '@/pipes/ParseImageFilePipe.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async findAll(@Query() query: FindAllDto) {
    const { users, total, page, limit } = await this.usersService.findAll({ ...query });
    return { total, page, limit, users: users.map((user) => new UserDto(user)) };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async me(@User() user: UserEntity) {
    return new MeDto(user);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async delete(@User() loggedUser: UserEntity) {
    const { user, message } = await this.usersService.delete(loggedUser.id);
    return { user: new UserDto(user), message };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async update(@User() loggedUser: UserEntity, @Body() body: UpdateDto) {
    const { user, message } = await this.usersService.update(loggedUser.id, body);
    return { user: new UserDto(user), message };
  }

  @Patch('me/picture')
  @UseInterceptors(FileInterceptor('picture'))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async updatePicture(@User() loggedUser: UserEntity, @UploadedFile(new ParseImageFilePipe()) picture: Express.Multer.File) {
    const { user, message } = await this.usersService.updatePicture(loggedUser.id, picture);
    return { user: new UserDto(user), message };
  }

  @Delete('me/picture')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async deletePicture(@User() loggedUser: UserEntity) {
    const { user, message } = await this.usersService.deletePicture(loggedUser.id);
    return { user: new UserDto(user), message };
  }

  @Get(':identifier')
  @HttpCode(HttpStatus.OK)
  public async findOne(@Param('identifier') identifier: number | string) {
    return new UserDto(await this.usersService.findOne(identifier));
  }
}
