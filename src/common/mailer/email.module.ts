// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({



      // useFactory: async (config: ConfigService) => ({
      //   transport: {
      //     host: config.get('EMAIL_HOST'),
      //     port: config.get('EMAIL_PORT'),
      //     secure: config.get('EMAIL_SECURE'), // true for 465, false for other ports
      //     auth: {
      //       user: config.get('EMAIL_USER'),
      //       pass: config.get('EMAIL_PASSWORD'),
      //     },
      //   },
      //   defaults: {
      //     from: `"${config.get('EMAIL_FROM_NAME')}" <${config.get('EMAIL_FROM_ADDRESS')}>`,
      //   },
      //   template: {
      //     dir: join(process.cwd(), 'views'), // Path to your templates
      //     adapter: new HandlebarsAdapter(), // Using handlebars
      //     options: {
      //       strict: true,
      //     },
      //   },
      // }),


      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('EMAIL_HOST'),
          port: parseInt(config.get<string>('EMAIL_PORT'), 10),
          secure: config.get<string>('EMAIL_SECURE') === 'true', // string to boolean
          auth: {
            user: config.get<string>('EMAIL_USER'),
            pass: config.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"${config.get('EMAIL_FROM_NAME')}" <${config.get('EMAIL_FROM_ADDRESS')}>`,
        },
        template: {
          dir: join(process.cwd(), 'views'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),

      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}