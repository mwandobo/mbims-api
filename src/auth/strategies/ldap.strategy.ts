// auth/ldap.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Correct import for passport-ldapauth
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LdapStrategy = require('passport-ldapauth').Strategy;

@Injectable()
export class LdapAuthStrategy extends PassportStrategy(LdapStrategy, 'ldap') {
  constructor(private configService: ConfigService) {
    super({
      server: {
        url: configService.get('LDAP_URL'),
        bindDN: configService.get('LDAP_BIND_DN'),
        bindCredentials: configService.get('LDAP_BIND_CREDENTIALS'),
        searchBase: configService.get('LDAP_SEARCH_BASE'),
        searchFilter: configService.get('LDAP_SEARCH_FILTER'),
        searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'memberOf'],
      },
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(payload: any) {
    return {
      username: payload.sAMAccountName,
      email: payload.mail,
      displayName: payload.displayName,
      groups: payload.memberOf || [],
    };
  }
}
