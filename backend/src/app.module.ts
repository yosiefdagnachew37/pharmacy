import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // 1. Config Module: Loads environment variables and configuration files
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available everywhere without importing it in other modules
      load: [databaseConfig], // Load our custom database config
    }),

    // 2. TypeORM Module: Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'), // Get the database config object
      }),
      inject: [ConfigService],
    }),

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
