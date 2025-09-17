import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures a directory exists, otherwise creates it.
 */
function ensureUploadDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Saves an uploaded file inside `uploads/<subDir>`.
 * Returns the relative path (e.g. `/uploads/contracts/file.pdf`).
 */
export async function saveUploadedFile(
  file: Express.Multer.File,
  subDir: string,
): Promise<string> {
  const uploadBasePath = path.join(process.cwd(), 'uploads', subDir);
  ensureUploadDirectoryExists(uploadBasePath);

  const filename = `${Date.now()}-${file.originalname}`;
  const fullPath = path.join(uploadBasePath, filename);

  await fs.promises.writeFile(fullPath, file.buffer);

  return `/uploads/${subDir}/${filename}`;
}
