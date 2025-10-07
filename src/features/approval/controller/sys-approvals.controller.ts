import { Controller, Get } from '@nestjs/common';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { SysApprovalService } from '../service/sys-approval.service';

@Controller('sys-approvals')
export class SysApprovalController {
  constructor(private readonly service: SysApprovalService) {}

  @Get()
  findAll(
    @Pagination() pagination: PaginationDto,
  ) {
    return this.service.findAll(pagination);
  }
}
