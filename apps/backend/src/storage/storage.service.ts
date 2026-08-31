import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
  }

  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  getFullPath(filename: string): string {
    return join(this.uploadDir, filename);
  }

  validateImageMagicBytes(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) return false;
    const signatures = [
      { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
      { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
      { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
      { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
    ];
    return signatures.some((sig) => buffer.subarray(0, sig.bytes.length).equals(Buffer.from(sig.bytes)));
  }

  async saveBuffer(buffer: Buffer, filename: string): Promise<string> {
    const uniqueName = `${Date.now()}-${uuidv4()}${filename}`;
    const fullPath = this.getFullPath(uniqueName);
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return this.getPublicUrl(uniqueName);
  }

  async compressAndSave(file: Express.Multer.File): Promise<string> {
    const filename = file.originalname || 'image.jpg';
    return this.saveBuffer(file.buffer, filename);
  }
}
