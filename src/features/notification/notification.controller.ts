import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Get,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificationService } from './notification.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationResponseDto } from './dtos/notification-response.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { AuthenticatedRequest } from '../../common/types/express-request.type';
import { QueryParameter } from '../../common/decorators/query-parameters.decorator';
import { SendNotificationDto } from './dtos/send-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.notificationService.findAll(pagination);
  }

  @Get(':id/read')
  readNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.read(id);
  }



  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.findOne(id);
  }


  @Post()
  @UseInterceptors(FileInterceptor('file')) // Handle file upload
  createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: AuthenticatedRequest, // Use the custom type here
  ) {
    return this.notificationService.create({
      ...createNotificationDto,
      userId: req.user.userId,
    });
  }

  @Post('send-notifications')
  sendNotification(
    @Body() body: SendNotificationDto,
    @Req() req: AuthenticatedRequest, // Use the custom type here
  ) {
    return this.notificationService.sendNotification({
      ...body,
      userId: req.user.userId,
    });
  }

  @Patch(':id')
  updateNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  deleteNotification(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.delete(id);
  }
}