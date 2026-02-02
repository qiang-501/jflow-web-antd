import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { Menu } from './menu.entity';
import { Permission } from '../permissions/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Permission])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
