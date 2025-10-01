// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';  // Add this import
import { ConfigModule } from '@nestjs/config';
import { LdapAuthService } from './services/ldap-auth.service';
import { NotificationModule } from '../../notification/notification.module';  // Add for ConfigService

@Module({
  imports: [
    ConfigModule.forRoot(),  // Add this for ConfigService
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { },
    }),
    NotificationModule
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LdapAuthService,
  ],  // Add JwtStrategy here
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}