import { v4 as uuid } from 'uuid';
import { extname } from 'path';

export class MulerHelper {
  static destinationPath(req, file, cb) {
    cb(null, './uploads/');
  }

  static customFileName(req, file, cb) {
    const fileExtension = extname(file.originalname);
    const fileName = `${Date.now()}-${uuid()}.${fileExtension}`;

    cb(null, fileName);
  }
}
