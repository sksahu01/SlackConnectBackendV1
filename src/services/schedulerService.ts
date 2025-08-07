import * as cron from 'node-cron';
import dotenv from 'dotenv';
import DatabaseManager from '../models/database';
import SlackService from './slackService';
import { ScheduledMessage } from '../models/types';

// Ensure environment variables are loaded
dotenv.config();

class SchedulerService {
  private db: DatabaseManager;
  private slackService: SlackService;
  private isRunning: boolean = false;
  private tasks: cron.ScheduledTask[] = [];

  constructor() {
    this.db = new DatabaseManager();
    this.slackService = new SlackService();
  }

  /**
   * Start the scheduler - runs every minute
   */
  start(): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting message scheduler...');

    // Run every minute
    const messageTask = cron.schedule('* * * * *', async () => {
      await this.processPendingMessages();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Clean up old messages daily at midnight
    const cleanupTask = cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldMessages();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.tasks.push(messageTask, cleanupTask);
    this.isRunning = true;
    console.log('Message scheduler started successfully');
  }

  /**
   * Process pending messages that are due to be sent
   */
  private async processPendingMessages(): Promise<void> {
    try {
      const pendingMessages = this.db.getPendingMessages();

      if (pendingMessages.length === 0) {
        return;
      }

      console.log(`Processing ${pendingMessages.length} pending messages`);

      // Process messages in parallel but with limited concurrency
      const batchSize = 5;
      for (let i = 0; i < pendingMessages.length; i += batchSize) {
        const batch = pendingMessages.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(message => this.sendScheduledMessage(message))
        );
      }
    } catch (error) {
      console.error('Error processing pending messages:', error);
    }
  }

  /**
   * Send a single scheduled message
   */
  private async sendScheduledMessage(message: ScheduledMessage): Promise<void> {
    try {
      // Check if this is a webhook message
      if (message.user_id === 'webhook-user') {
        // Handle webhook-based message
        const webhookUrl = process.env.SLACK_WEBHOOK_URL;
        if (!webhookUrl) {
          throw new Error('Webhook URL not configured');
        }

        await this.slackService.sendWebhookMessage(webhookUrl, message.message);

        // Update message status to sent
        this.db.updateScheduledMessage(message.id, {
          status: 'sent',
          sent_at: Math.floor(Date.now() / 1000)
        });

        console.log(`Successfully sent scheduled webhook message ${message.id} to TeamAlpha workspace`);
        return;
      }

      // Handle OAuth-based message
      const user = this.db.getUserById(message.user_id);
      if (!user) {
        throw new Error(`User not found: ${message.user_id}`);
      }

      // Test if token is still valid
      const isValidToken = await this.slackService.testToken(user.access_token);
      if (!isValidToken) {
        throw new Error('Access token is invalid or expired');
      }

      // Send the message
      await this.slackService.sendMessage(
        user.access_token,
        message.channel_id,
        message.message
      );

      // Update message status to sent
      this.db.updateScheduledMessage(message.id, {
        status: 'sent',
        sent_at: Math.floor(Date.now() / 1000)
      });

      console.log(`Successfully sent scheduled message ${message.id} to channel ${message.channel_name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send scheduled message ${message.id}:`, errorMessage);

      // Update message status to failed
      this.db.updateScheduledMessage(message.id, {
        status: 'failed',
        error_message: errorMessage
      });
    }
  }

  /**
   * Clean up old sent/cancelled messages
   */
  private async cleanupOldMessages(): Promise<void> {
    try {
      const deletedCount = this.db.cleanupOldMessages(30); // 30 days
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old messages`);
      }
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    // Stop all scheduled tasks
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    this.isRunning = false;
    console.log('Scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus(): { running: boolean; pendingCount: number } {
    const pendingMessages = this.db.getPendingMessages();
    return {
      running: this.isRunning,
      pendingCount: pendingMessages.length
    };
  }
}

export default SchedulerService;
