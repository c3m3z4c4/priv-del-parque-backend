import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { MeetingsModule } from './meetings/meetings.module';
import { HousesModule } from './houses/houses.module';

@Module({
  imports: [
    // 1️⃣ Variables de entorno (global)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2️⃣ Conexión a PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // ⚠️ en prod real luego lo apagamos
    }),

    // 3️⃣ Módulos de la app
    AuthModule,
    UsersModule,
    EventsModule,
    MeetingsModule,
    HousesModule,
  ],
  controllers: [AppController], // ✅ SOLO AppController
  providers: [AppService],
})
export class AppModule {}
