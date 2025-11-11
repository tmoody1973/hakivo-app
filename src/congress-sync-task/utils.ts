import { SyncJob, SyncConfig, SyncExecutionResult } from './interfaces';

export async function createSyncJob(
  _jobType: SyncJob['jobType'],
  _env: any
): Promise<SyncJob> {
  throw new Error('Not implemented');
}

export async function getLastSyncTime(
  _jobType: SyncJob['jobType'],
  _env: any
): Promise<string | null> {
  throw new Error('Not implemented');
}

export async function syncBills(_env: any): Promise<{
  _totalProcessed: number;
  _successCount: number;
  _errorCount: number;
  _errors: string[];
}> {
  throw new Error('Not implemented');
}

export async function syncMembers(_env: any): Promise<{
  _totalProcessed: number;
  _successCount: number;
  _errorCount: number;
  _errors: string[];
}> {
  throw new Error('Not implemented');
}

export async function updateSyncJobStatus(
  _jobId: string,
  _status: SyncJob['status'],
  _result?: Partial<SyncJob>,
  _env?: any
): Promise<void> {
  throw new Error('Not implemented');
}

export async function executeSyncTask(
  _config: SyncConfig,
  _env: any
): Promise<SyncExecutionResult> {
  throw new Error('Not implemented');
}

export function shouldRunSync(
  _lastSyncTime: string | null,
  _intervalHours: number
): boolean {
  throw new Error('Not implemented');
}

