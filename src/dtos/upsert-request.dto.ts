/**
 * Dtos within *.dto.ts files will auto-generate
 * the open api documentation for the API which is
 * accessible at /api via swagger
 */

import { Base, Document } from './common.dto';

export class UpsertRequest extends Base<UpsertRequest> {
  documents: Document[];
}
export class UpsertFileRequest extends Base<UpsertRequest> {
  file: Document[];
}

export class UpsertResponse extends Base<UpsertResponse> {
  ids: string[];
}
