import { Task, Event } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

/**
 * Congress Sync Task
 * Scheduled task that runs periodically to sync data from Congress.gov
 * Runs every 6 hours via cron: "0 0,6,12,18 * * *"
 */
export default class extends Task<Env> {
  async handle(event: Event): Promise<void> {
    this.env.logger.info('Congress sync task started', { event });

    try {
      // Sync current congress (119) and previous congress (118)
      await this.syncCongress(119);
      await this.syncCongress(118);

      // Sync current members
      await this.syncMembers();

      // Sync committees
      await this.syncCommittees();

      this.env.logger.info('Congress sync task completed successfully');
    } catch (error) {
      this.env.logger.error('Congress sync task failed:', error as any);
      throw error;
    }
  }

  private async syncCongress(congress: number): Promise<void> {
    this.env.logger.info(`Syncing Congress ${congress}...`);

    try {
      // Call the ingestion service for bills
      const response = await this.env.CONGRESS_INGESTION.fetch(
        new Request('http://internal/ingest/bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            congress,
            limit: 250, // Fetch in batches of 250
          }),
        })
      );

      const result = await response.json();
      this.env.logger.info(`Congress ${congress} sync result:`, result as any);
    } catch (error) {
      this.env.logger.error(`Error syncing Congress ${congress}:`, error as any);
      throw error;
    }
  }

  private async syncMembers(): Promise<void> {
    this.env.logger.info('Syncing members...');

    try {
      // Sync current members only
      const response = await this.env.CONGRESS_INGESTION.fetch(
        new Request('http://internal/ingest/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limit: 250,
            currentMembersOnly: true,
          }),
        })
      );

      const result = await response.json();
      this.env.logger.info('Members sync result:', result as any);
    } catch (error) {
      this.env.logger.error('Error syncing members:', error as any);
      throw error;
    }
  }

  private async syncCommittees(): Promise<void> {
    this.env.logger.info('Syncing committees...');

    try {
      const response = await this.env.CONGRESS_INGESTION.fetch(
        new Request('http://internal/ingest/committees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );

      const result = await response.json();
      this.env.logger.info('Committees sync result:', result as any);
    } catch (error) {
      this.env.logger.error('Error syncing committees:', error as any);
      throw error;
    }
  }
}
