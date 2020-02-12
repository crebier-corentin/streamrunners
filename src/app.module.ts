import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import ormconfig from './ormconfig';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(ormconfig), UserModule, AuthModule],
    controllers: [AppController],
})
export class AppModule {}
