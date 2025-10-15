// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dtos/login.dto';
import { LdapAuthService } from './ldap-auth.service';
import { LdapResponceDto } from '../dtos/ldap-response.dto';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../../../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private ldapAuthService: LdapAuthService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async validateLocalUser(email: string, pass: string) {
    const user = await this.usersService.findForAuth(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(pass.trim(), user.password.trim());
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const useLdap = this.configService.get('USE_LDAP_AUTH') === 'true';

    // console.log('use ldap auth', useLdap);

    if (useLdap) {
      try {
        return await this.ldapAuthService.validateUser(username, password);
      } catch (err) {
        throw new UnauthorizedException('LDAP Authentication failed');
      }
    } else {
      // Return mock user in development
      const devUser = await this.usersService.findForAuth(username);
      if (!devUser) {
        const userPayload = {
          name: 'Dev User',
          username: 'devuser',
          email: 'admin@gmail.com',
          password: '123456',
        };
        return await this.usersService.create(userPayload);
      }
      return devUser;
    }
  }

  async login(body: LoginDto) {
    const { email, password } = body;
    const ldapUser: LdapResponceDto = await this.validateUser(email, password);

    if (!ldapUser) {
      return { message: 'Invalid credentials' };
    }

    let savedUser = await this.usersService.findForAuth(ldapUser.email);

    // console.log('saved user', savedUser);
    if (!savedUser) {
      const userPayload = {
        name: ldapUser.displayName,
        username: ldapUser.username,
        email: ldapUser.email,
        password: password,
      };
      savedUser = await this.usersService.create(userPayload);
    }

    const payload = {
      email: ldapUser.email,
      sub: savedUser.id,
      roleId: savedUser.role?.id,
    };

    console.log('payload', payload )

    const userNotificationBody = await this.notificationService.findByUserId(
      savedUser.id,
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: savedUser,
      notifications: userNotificationBody.notifications,
    };
  }

  async register(userDto: any) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const newUser = await this.usersService.create({
      ...userDto,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser;
    return result;
  }
}
