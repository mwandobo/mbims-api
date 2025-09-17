import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './controllers/client.controller';
import { ClientsService } from './services/client.service';
import { Client } from './entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client])], // must import the entity here
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientModule {}
