import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

import { CreateExcelComparisonDto } from './dtos/create-excel-comparison.dto';
import { BaseService } from '../../common/services/base-service';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { ContractResponseDto } from './dtos/contract-response.dto';
import { ExcelComparisonEntity } from './entities/excel-comparison.entity';

@Injectable()
export class ExcelComparisonService extends BaseService<ExcelComparisonEntity> {
  private readonly logger = new Logger(ExcelComparisonService.name);
  private readonly UPLOAD_PATH = 'uploads/contracts';

  constructor(
    @InjectRepository(ExcelComparisonEntity)
    private readonly excelComparisonRepository: Repository<ExcelComparisonEntity>,
  ) {
    super(excelComparisonRepository);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ContractResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['party', 'department'], // relations
      {
        fields: ['title', 'group'],
        relations: {
          department: ['name'],
          party: ['name', 'email'],
        },
      },
    );

    return {
      ...response,
      data: response.data.map((contract) =>
        ContractResponseDto.fromContract(contract),
      ),
    };
  }

  // async compareExcel(
  //   files: Express.Multer.File[], // Expecting 2 files
  // ): Promise<any> {
  //   if (!files || files.length < 2) {
  //     throw new BadRequestException('Two Excel files are required for comparison');
  //   }
  //
  //   // Load file1
  //   const workbook1 = XLSX.read(files[0].buffer, { type: 'buffer' });
  //   const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
  //   const data1 = XLSX.utils.sheet_to_json(sheet1);
  //
  //   // Load file2
  //   const workbook2 = XLSX.read(files[1].buffer, { type: 'buffer' });
  //   const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
  //   const data2 = XLSX.utils.sheet_to_json(sheet2);
  //
  //   // Extract columns
  //   const referenceNos = new Set(data1.map((row: any) => row['referenceNo']));
  //   const rrns = new Set(data2.map((row: any) => row['RRN']));
  //
  //   const matches = [...referenceNos].filter((ref) => rrns.has(ref));
  //   const missingInFile2 = [...referenceNos].filter((ref) => !rrns.has(ref));
  //   const missingInFile1 = [...rrns].filter((rrn) => !referenceNos.has(rrn));
  //
  //   return {
  //     matches,
  //     missingInFile2,
  //     missingInFile1,
  //   };
  // }

  // async compareExcel(
  //   files: Express.Multer.File[], // Expecting 2 files
  // ): Promise<any> {
  //   if (!files || files.length < 2) {
  //     this.logger.error('Less than 2 files uploaded');
  //     throw new BadRequestException(
  //       'Two Excel files are required for comparison',
  //     );
  //   }
  //
  //   this.logger.log(`Received ${files.length} files for comparison`);
  //
  //   // Load file1
  //   this.logger.log(`Reading first file: ${files[0].originalname}`);
  //   const workbook1 = XLSX.read(files[0].buffer, { type: 'buffer' });
  //   const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
  //   const data1 = XLSX.utils.sheet_to_json(sheet1);
  //
  //   this.logger.debug(`File1 rows parsed: ${data1.length}`);
  //
  //   // Load file2
  //   this.logger.log(`Reading second file: ${files[1].originalname}`);
  //   const workbook2 = XLSX.read(files[1].buffer, { type: 'buffer' });
  //   const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
  //   const data2 = XLSX.utils.sheet_to_json(sheet2);
  //
  //   this.logger.debug(`File2 rows parsed: ${data2.length}`);
  //
  //   // Extract columns
  //   const referenceNos = new Set(data1.map((row: any) => row['referenceNo']));
  //   const rrns = new Set(data2.map((row: any) => row['RRN']));
  //
  //   this.logger.log(`Extracted ${referenceNos.size} referenceNos from File1`);
  //   this.logger.log(`Extracted ${rrns.size} RRNs from File2`);
  //
  //   const matches = [...referenceNos].filter((ref) => rrns.has(ref));
  //   const missingInFile2 = [...referenceNos].filter((ref) => !rrns.has(ref));
  //   const missingInFile1 = [...rrns].filter((rrn) => !referenceNos.has(rrn));
  //
  //   this.logger.log(`Found ${matches.length} matches`);
  //   this.logger.warn(`Missing in File2: ${missingInFile2.length}`);
  //   this.logger.warn(`Missing in File1: ${missingInFile1.length}`);
  //
  //   return {
  //     matches,
  //     missingInFile2,
  //     missingInFile1,
  //   };
  // }

  // async compareExcel(
  //   files: Express.Multer.File[], // Expecting 2 files
  // ): Promise<any> {
  //   if (!files || files.length < 2) {
  //     this.logger.error('Less than 2 files uploaded');
  //     throw new BadRequestException(
  //       'Two Excel files are required for comparison',
  //     );
  //   }
  //
  //   this.logger.log(`Received ${files.length} files for comparison`);
  //
  //   // Parse both files
  //   const parsedFiles = files.map((file) => {
  //     this.logger.log(`Reading file: ${file.originalname}`);
  //     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //     const data = XLSX.utils.sheet_to_json(sheet);
  //     this.logger.debug(
  //       `${file.originalname} rows parsed: ${data.length}`,
  //     );
  //     return { name: file.originalname, data };
  //   });
  //
  //   // Identify which file has which column
  //   const colA = Object.keys(parsedFiles[0].data[0] || {});
  //   const colB = Object.keys(parsedFiles[1].data[0] || {});
  //
  //   const refFile =
  //     colA.includes('referenceNo') || colA.includes('REFERENCE_NO')
  //       ? parsedFiles[0]
  //       : parsedFiles[1];
  //
  //   const rrnFile =
  //     colA.includes('RRN') || colA.includes('rrn')
  //       ? parsedFiles[0]
  //       : parsedFiles[1];
  //
  //   if (!refFile || !rrnFile) {
  //     this.logger.error('Could not detect required columns (referenceNo / RRN)');
  //     throw new BadRequestException(
  //       'Both referenceNo and RRN columns must exist in the uploaded files',
  //     );
  //   }
  //
  //   // Extract sets
  //   const referenceNos = new Set(
  //     refFile.data.map((row: any) => row['referenceNo'] || row['REFERENCE_NO']),
  //   );
  //   const rrns = new Set(rrnFile.data.map((row: any) => row['RRN'] || row['rrn']));
  //
  //   this.logger.log(
  //     `Extracted ${referenceNos.size} referenceNos from ${refFile.name}`,
  //   );
  //   this.logger.log(`Extracted ${rrns.size} RRNs from ${rrnFile.name}`);
  //
  //   const matches = [...referenceNos].filter((ref) => rrns.has(ref));
  //   const missingInRRNFile = [...referenceNos].filter((ref) => !rrns.has(ref));
  //   const missingInRefFile = [...rrns].filter((rrn) => !referenceNos.has(rrn));
  //
  //   this.logger.log(`Found ${matches.length} matches`);
  //   this.logger.warn(
  //     `Missing in ${rrnFile.name}: ${missingInRRNFile.length}`,
  //   );
  //   this.logger.warn(
  //     `Missing in ${refFile.name}: ${missingInRefFile.length}`,
  //   );
  //
  //   // Return with file names
  //   return {
  //     matches,
  //     missing: {
  //       [rrnFile.name]: missingInRRNFile,
  //       [refFile.name]: missingInRefFile,
  //     },
  //   };
  // }

  // async compareExcel(
  //   files: Express.Multer.File[],
  // ): Promise<any> {
  //   if (!files || files.length < 2) {
  //     this.logger.error('Less than 2 files uploaded');
  //     throw new BadRequestException(
  //       'Two Excel files are required for comparison',
  //     );
  //   }
  //
  //   this.logger.log(`Received ${files.length} files for comparison`);
  //
  //   // Parse each file into a dataset
  //   const datasets = files.map((file) => {
  //     this.logger.log(`Reading file: ${file.originalname}`);
  //     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //     const data = XLSX.utils.sheet_to_json(sheet);
  //
  //     this.logger.debug(`${file.originalname} rows parsed: ${data.length}`);
  //
  //     // Detect the column dynamically (pick the first non-empty column)
  //     const sampleRow = data[0] || {};
  //     const key = Object.keys(sampleRow).find(
  //       (col) => sampleRow[col] !== null && sampleRow[col] !== undefined,
  //     );
  //
  //     if (!key) {
  //       this.logger.error(
  //         `No usable column found in ${file.originalname}`,
  //       );
  //       throw new BadRequestException(
  //         `No usable column found in ${file.originalname}`,
  //       );
  //     }
  //
  //     this.logger.log(
  //       `Using column "${key}" from ${file.originalname}`,
  //     );
  //
  //     const values = new Set(
  //       data
  //         .map((row: any) => row[key])
  //         .filter((v) => v !== null && v !== undefined && v !== ''),
  //     );
  //
  //     this.logger.log(
  //       `Extracted ${values.size} values from ${file.originalname}`,
  //     );
  //
  //     return {
  //       fileName: file.originalname,
  //       values,
  //     };
  //   });
  //
  //   // Compare datasets (assuming only 2 files)
  //   const [setA, setB] = datasets;
  //
  //   const matches = [...setA.values].filter((val) => setB.values.has(val));
  //
  //   const missing = {
  //     [setA.fileName]: [...setA.values].filter((val) => !setB.values.has(val)),
  //     [setB.fileName]: [...setB.values].filter((val) => !setA.values.has(val)),
  //   };
  //
  //   this.logger.log(`Found ${matches.length} matches`);
  //   this.logger.warn(
  //     `Missing in ${setA.fileName}: ${missing[setA.fileName].length}`,
  //   );
  //   this.logger.warn(
  //     `Missing in ${setB.fileName}: ${missing[setB.fileName].length}`,
  //   );
  //
  //   return {
  //     matches,
  //     missing,
  //   };
  // }

  // async compareExcel(files: Express.Multer.File[]): Promise<any> {
  //   if (!files || files.length < 2) {
  //     this.logger.error('Less than 2 files uploaded');
  //     throw new BadRequestException('Two Excel files are required for comparison');
  //   }
  //
  //   this.logger.log(`Received ${files.length} files for comparison`);
  //
  //   // Parse both files
  //   const datasets = files.map((file) => {
  //     this.logger.log(`Reading file: ${file.originalname}`);
  //     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //
  //     // Force array of arrays
  //     const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  //     this.logger.debug(`${file.originalname} rows parsed: ${data.length}`);
  //
  //     // Find the header row safely
  //     const headerRow = data.find(
  //       (row) => Array.isArray(row) && (row.includes('Reference Number') || row.includes('RRN')),
  //     );
  //
  //     if (!headerRow) {
  //       this.logger.error(`No valid header found in ${file.originalname}`);
  //       throw new BadRequestException(`Could not detect headers in ${file.originalname}`);
  //     }
  //
  //     const colIndex =
  //       headerRow.indexOf('Reference Number') !== -1
  //         ? headerRow.indexOf('Reference Number')
  //         : headerRow.indexOf('RRN');
  //
  //     if (colIndex === -1) {
  //       throw new BadRequestException(`Could not find valid column in ${file.originalname}`);
  //     }
  //
  //     const key = headerRow[colIndex];
  //     this.logger.log(`Using column "${key}" from ${file.originalname}`);
  //
  //     // Collect values below header safely
  //     const startRow = data.indexOf(headerRow) + 1;
  //     const values = new Set(
  //       data
  //         .slice(startRow)
  //         .map((row) => (Array.isArray(row) ? row[colIndex] : null))
  //         .filter((v) => v !== null && v !== undefined && v !== ''),
  //     );
  //
  //     this.logger.log(`Extracted ${values.size} values from ${file.originalname}`);
  //
  //     return {
  //       fileName: file.originalname,
  //       key,
  //       values,
  //     };
  //   });
  //
  //   // Compare two datasets
  //   const [setA, setB] = datasets;
  //
  //   const matches = [...setA.values].filter((val) => setB.values.has(val));
  //
  //   const missing = {
  //     [setA.fileName]: [...setA.values].filter((val) => !setB.values.has(val)),
  //     [setB.fileName]: [...setB.values].filter((val) => !setA.values.has(val)),
  //   };
  //
  //   this.logger.log(`Found ${matches.length} matches`);
  //   this.logger.warn(`Missing in ${setA.fileName}: ${missing[setA.fileName].length}`);
  //   this.logger.warn(`Missing in ${setB.fileName}: ${missing[setB.fileName].length}`);
  //
  //   return {
  //     matches,
  //     missing,
  //   };
  // }

  async compareExcel(files: Express.Multer.File[]): Promise<any> {
    if (!files || files.length < 2) {
      this.logger.error('Less than 2 files uploaded');
      throw new BadRequestException(
        'Two Excel files are required for comparison',
      );
    }

    this.logger.log(`Received ${files.length} files for comparison`);

    // Helper to normalize values (convert to string and trim)
    const normalize = (val: any) =>
      val !== null && val !== undefined ? String(val).trim() : '';

    // Parse both files
    const datasets = files.map((file) => {
      this.logger.log(`Reading file: ${file.originalname}`);
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Force array of arrays
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      }) as any[];
      this.logger.debug(`${file.originalname} rows parsed: ${data.length}`);

      // Find the header row safely
      const headerRow = data.find(
        (row) =>
          Array.isArray(row) &&
          (row.includes('Reference Number') || row.includes('RRN')),
      );

      if (!headerRow) {
        this.logger.error(`No valid header found in ${file.originalname}`);
        throw new BadRequestException(
          `Could not detect headers in ${file.originalname}`,
        );
      }

      const colIndex =
        headerRow.indexOf('Reference Number') !== -1
          ? headerRow.indexOf('Reference Number')
          : headerRow.indexOf('RRN');

      if (colIndex === -1) {
        throw new BadRequestException(
          `Could not find valid column in ${file.originalname}`,
        );
      }

      const key = headerRow[colIndex];
      this.logger.log(`Using column "${key}" from ${file.originalname}`);

      // Collect values below header safely and normalize
      const startRow = data.indexOf(headerRow) + 1;
      const values = new Set(
        data
          .slice(startRow)
          .map((row) => (Array.isArray(row) ? normalize(row[colIndex]) : null))
          .filter((v) => v !== null && v !== ''),
      );

      this.logger.log(
        `Extracted ${values.size} values from ${file.originalname}`,
      );

      return {
        fileName: file.originalname,
        key,
        values,
      };
    });

    // Compare two datasets
    const [setA, setB] = datasets;

    const setAValues = new Set([...setA.values]);
    const setBValues = new Set([...setB.values]);

    const matches = [...setAValues].filter((val) => setBValues.has(val));

    const missing = {
      [setA.fileName]: [...setAValues].filter((val) => !setBValues.has(val)),
      [setB.fileName]: [...setBValues].filter((val) => !setAValues.has(val)),
    };

    this.logger.log(`Found ${matches.length} matches`);
    this.logger.warn(
      `Missing in ${setA.fileName}: ${missing[setA.fileName].length}`,
    );
    this.logger.warn(
      `Missing in ${setB.fileName}: ${missing[setB.fileName].length}`,
    );

    return {
      matches,
      missing,
    };
  }
}
