/**
 * Dtos within *.dto.ts files will auto-generate
 * the open api documentation for the API which is
 * accessible at /api via swagger
 */

import { Base, DocumentMetadataFilter } from './common.dto';

export class DeleteRequest extends Base<DeleteRequest> {
  ids?: string[];
  filter?: DocumentMetadataFilter;
  deleteAll?: boolean;
}

export class DeleteResponse extends Base<DeleteResponse> {
  success: boolean;
}
