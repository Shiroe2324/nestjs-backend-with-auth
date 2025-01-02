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

import { RequiredRoles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { User as UserEntity } from '@/entities/user.entity';
import { Roles } from '@/enums/roles.enum';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { RolesGuard } from '@/guards/roles.guard';
import { FindAllDto } from '@/modules/users/dto/find-all.dto';
import { MeDto } from '@/modules/users/dto/me.dto';
import { UpdateDto } from '@/modules/users/dto/update.dto';
import { UserDto } from '@/modules/users/dto/user.dto';
import { UsersService } from '@/modules/users/users.service';
import { ParseImageFilePipe } from '@/pipes/parse-image-file.pipe';

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

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async update(@User('id') userId: number, @Body() body: UpdateDto) {
    const { user, message } = await this.usersService.update(userId, body);
    return { user: new UserDto(user), message };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async delete(@User('id') userId: number) {
    const { user, message } = await this.usersService.delete(userId);
    return { user: new UserDto(user), message };
  }

  @Patch('me/picture')
  @UseInterceptors(FileInterceptor('picture'))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async updatePicture(@User('id') userId: number, @UploadedFile(new ParseImageFilePipe()) picture: Express.Multer.File) {
    const { user, message } = await this.usersService.updatePicture(userId, picture);
    return { user: new UserDto(user), message };
  }

  @Delete('me/picture')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async deletePicture(@User('id') userId: number) {
    const { user, message } = await this.usersService.deletePicture(userId);
    return { user: new UserDto(user), message };
  }

  @Get(':identifier')
  @HttpCode(HttpStatus.OK)
  public async findOne(@Param('identifier') identifier: number | string) {
    return new UserDto(await this.usersService.findOne(identifier));
  }

  @Put(':identifier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles([Roles.ADMIN])
  @HttpCode(HttpStatus.OK)
  public async updateOne(@Param('identifier') identifier: number | string, @Body() body: UpdateDto) {
    const { user, message } = await this.usersService.update(identifier, body);
    return { user: new UserDto(user), message };
  }

  @Delete(':identifier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles([Roles.ADMIN])
  @HttpCode(HttpStatus.OK)
  public async deleteOne(@Param('identifier') identifier: number | string) {
    const { user, message } = await this.usersService.delete(identifier);
    return { user: new UserDto(user), message };
  }

  @Patch(':identifier/picture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles([Roles.ADMIN])
  @UseInterceptors(FileInterceptor('picture'))
  @HttpCode(HttpStatus.OK)
  public async updateOnePicture(
    @Param('identifier') identifier: number | string,
    @UploadedFile(new ParseImageFilePipe()) picture: Express.Multer.File,
  ) {
    const { user, message } = await this.usersService.updatePicture(identifier, picture);
    return { user: new UserDto(user), message };
  }

  @Delete(':identifier/picture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles([Roles.ADMIN])
  @HttpCode(HttpStatus.OK)
  public async deleteOnePicture(@Param('identifier') identifier: number | string) {
    const { user, message } = await this.usersService.deletePicture(identifier);
    return { user: new UserDto(user), message };
  }
}
