import {
  BucketEvent,
  BillDocumentMetadata,
  IndexingResult
} from './interfaces';

export async function fetchDocumentFromBucket(
  _bucketName: string,
  _objectKey: string,
  _env: any
): Promise<string> {
  throw new Error('Not implemented');
}

export async function extractMetadata(
  _objectKey: string,
  _content: string
): Promise<BillDocumentMetadata> {
  throw new Error('Not implemented');
}

export async function chunkDocument(_content: string): Promise<string[]> {
  throw new Error('Not implemented');
}

export async function indexChunks(
  _billId: string,
  _chunks: string[],
  _metadata: BillDocumentMetadata,
  _env: any
): Promise<void> {
  throw new Error('Not implemented');
}

export async function processBillDocument(
  _event: BucketEvent,
  _env: any
): Promise<IndexingResult> {
  throw new Error('Not implemented');
}

export async function updateBillIndexStatus(
  _billId: string,
  _indexed: boolean,
  _env: any
): Promise<void> {
  throw new Error('Not implemented');
}
