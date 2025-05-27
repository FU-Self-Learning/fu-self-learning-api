import { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { extname } from 'path';

export const storage = diskStorage({
  destination: tmpdir(),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});
