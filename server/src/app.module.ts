import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { FormsModule } from './modules/forms/forms.module';
import { AuthModule } from './modules/auth/auth.module';
import { MenusModule } from './modules/menus/menus.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Disabled - use seed script or migrations
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    WorkflowsModule,
    FormsModule,
    MenusModule,
  ],
})
export class AppModule {}
