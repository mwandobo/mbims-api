import { Injectable, Logger } from '@nestjs/common';
import * as ldap from 'ldapjs';

@Injectable()
export class LdapAuthService {
  private readonly logger = new Logger(LdapAuthService.name);

  async validateUser(username: string, password: string): Promise<any> {
    this.logger.log(`Starting LDAP validation for user: ${username}`);

    const ldapUrl = process.env.LDAP_URL;
    const bindDN = process.env.LDAP_BIND_DN;
    const bindCredentials = process.env.LDAP_BIND_CREDENTIALS;
    const searchBase = process.env.LDAP_SEARCH_BASE;
    const searchFilter = `(sAMAccountName=${username})`;

    this.logger.log(`LDAP_URL: ${ldapUrl}`);
    this.logger.log(`LDAP_BIND_DN: ${bindDN}`);
    this.logger.log(`LDAP_BIND_CREDENTIALS: ${bindCredentials}`);

    // Create a fresh client per request
    const client = ldap.createClient({
      url: ldapUrl,
      timeout: 5000,
      connectTimeout: 10000,
    });

    client.on('connect', () => this.logger.log('LDAP client connected'));
    client.on('error', (err) =>
      this.logger.error('LDAP client error:', err.message),
    );

    return new Promise((resolve, reject) => {
      // Step 1: Bind as service account
      this.logger.log('Binding as service account...');
      client.bind(bindDN, bindCredentials, (err) => {
        if (err) {
          this.logger.error('Service account bind failed:', err.message);
          client.unbind();
          return reject('LDAP bind failed');
        }

        this.logger.log('Service account bind successful');
        this.logger.log(`Searching for user: ${searchFilter}`);

        // Step 2: Search for user
        client.search(
          searchBase,
          {
            filter: searchFilter,
            scope: 'sub',
            attributes: ['displayName', 'mail', 'sAMAccountName', 'memberOf'],
          },
          (searchErr, res) => {
            if (searchErr) {
              this.logger.error('User search failed:', searchErr.message);
              client.unbind();
              return reject('User search failed');
            }

            let userEntry: any;

            res.on('searchEntry', (entry) => {
              const raw = (entry as any).json;

              if (!raw || !raw.attributes) {
                this.logger.warn('Entry exists but has no attributes');
                return;
              }

              const user: Record<string, any> = {};
              raw.attributes.forEach((attr: any) => {
                user[attr.type] =
                  attr.values.length === 1 ? attr.values[0] : attr.values;
              });

              this.logger.log(
                'Parsed LDAP user entry:',
                JSON.stringify(user, null, 2),
              );

              userEntry = {
                dn: raw.objectName,
                ...user,
              };
            });

            res.on('error', (err) => {
              this.logger.error('LDAP search error:', err.message);
              client.unbind();
              reject('Search error');
            });

            res.on('end', (result) => {
              this.logger.log('Search completed. Status:', result?.status);
              if (!userEntry) {
                this.logger.warn('LDAP User not found.');
                client.unbind();
                return reject('LDAP User not found');
              }

              // Step 3: Validate user credentials
              this.logger.log(`Validating credentials for: ${userEntry.dn}`);
              client.bind(userEntry.dn, password, (bindErr) => {
                client.unbind(); // Always unbind after operation
                if (bindErr) {
                  this.logger.warn(
                    'Invalid credentials:',
                    bindErr.message,
                  );
                  return reject('Invalid credentials');
                }

                this.logger.log('User authenticated successfully');
                resolve({
                  username: userEntry.sAMAccountName,
                  email: userEntry.mail,
                  displayName: userEntry.displayName,
                  groups: userEntry.memberOf || [],
                });
              });
            });
          },
        );
      });
    });
  }
}
