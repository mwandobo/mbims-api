export class PaginationDto {
  page: number = 1;
  limit: number = 10;
  q?: string; // for search/filter
  // Add other common query params here
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, pagination: PaginationDto) {
    this.data = data;
    this.pagination = {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}