import { Module, DynamicModule, Logger } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  private static readonly logger = new Logger(DatabaseModule.name);

  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (
            configService: ConfigService,
          ): Promise<TypeOrmModuleOptions> => {
            const host = configService.get<string>('DB_HOST');
            const port = configService.get<number>('DB_PORT');
            const username = configService.get<string>('DB_USERNAME');
            const database = configService.get<string>('DB_NAME');

            // DatabaseModule.logger.log(`Connecting to database at ${host}:${port} as ${username}, using DB: ${database}`);

            return {
              type: configService.get<never>('DB_TYPE') ?? 'postgres',
              host,
              port,
              username,
              password: configService.get<string>('DB_PASSWORD'),
              database,
              autoLoadEntities: true,
              synchronize: true, // disable in production
            };
          },
        }),
      ],
    };
  }
}
