import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class PdfService {
  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }
}
