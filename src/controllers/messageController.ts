import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import SlackService from '../services/slackService';
import DatabaseManager from '../models/database';
import { ApiResponse, SendMessageRequest, ScheduleMessageRequest } from '../models/types';

// Ensure environment variables are loaded
dotenv.config();

class MessageController {
  private slackService: SlackService;
  private db: DatabaseManager;

  constructor() {
    this.slackService = new SlackService();
    this.db = new DatabaseManager();
  }

  /**
   * Get user's Slack channels
   */
  public getChannels = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!; // Guaranteed by auth middleware

      const channels = await this.slackService.getChannels(user.access_token);

      res.json({
        success: true,
        data: channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          is_private: channel.is_private,
          is_general: channel.is_general,
          is_archived: channel.is_archived,
          is_member: channel.is_member
        }))
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting channels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get channels'
      } as ApiResponse);
    }
  };

  /**
   * Send immediate message to Slack
   */
  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { channel_id, message } = req.body as SendMessageRequest;

      await this.slackService.sendMessage(user.access_token, channel_id, message);

      res.json({
        success: true,
        message: 'Message sent successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      } as ApiResponse);
    }
  };

  /**
   * Schedule a message for future delivery
   */
  public scheduleMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { channel_id, channel_name, message, scheduled_for } = req.body as ScheduleMessageRequest;

      const scheduledMessage = this.db.createScheduledMessage({
        id: uuidv4(),
        user_id: user.id,
        channel_id,
        channel_name,
        message,
        scheduled_for,
        status: 'pending'
      });

      res.json({
        success: true,
        data: {
          id: scheduledMessage.id,
          channel_id: scheduledMessage.channel_id,
          channel_name: scheduledMessage.channel_name,
          message: scheduledMessage.message,
          scheduled_for: scheduledMessage.scheduled_for,
          status: scheduledMessage.status,
          created_at: scheduledMessage.created_at
        },
        message: 'Message scheduled successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error scheduling message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule message'
      } as ApiResponse);
    }
  };

  /**
   * Get user's scheduled messages
   */
  public getScheduledMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;

      const scheduledMessages = this.db.getScheduledMessagesByUserId(user.id);

      res.json({
        success: true,
        data: scheduledMessages.map(msg => ({
          id: msg.id,
          channel_id: msg.channel_id,
          channel_name: msg.channel_name,
          message: msg.message,
          scheduled_for: msg.scheduled_for,
          status: msg.status,
          created_at: msg.created_at,
          sent_at: msg.sent_at,
          error_message: msg.error_message
        }))
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting scheduled messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scheduled messages'
      } as ApiResponse);
    }
  };

  /**
   * Cancel a scheduled message
   */
  public cancelScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const success = this.db.deleteScheduledMessage(id, user.id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Scheduled message not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Scheduled message cancelled successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error cancelling scheduled message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel scheduled message'
      } as ApiResponse);
    }
  };

  /**
   * Update a scheduled message (if not yet sent)
   */
  public updateScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { message, scheduled_for } = req.body;

      // Get the message first to check ownership and status
      const scheduledMessages = this.db.getScheduledMessagesByUserId(user.id);
      const existingMessage = scheduledMessages.find(msg => msg.id === id);

      if (!existingMessage) {
        res.status(404).json({
          success: false,
          error: 'Scheduled message not found'
        } as ApiResponse);
        return;
      }

      if (existingMessage.status !== 'pending') {
        res.status(400).json({
          success: false,
          error: 'Cannot update message that has already been sent or cancelled'
        } as ApiResponse);
        return;
      }

      // Update the message
      const updates: any = {};
      if (message !== undefined) updates.message = message;
      if (scheduled_for !== undefined) updates.scheduled_for = scheduled_for;

      this.db.updateScheduledMessage(id, updates);

      res.json({
        success: true,
        message: 'Scheduled message updated successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating scheduled message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update scheduled message'
      } as ApiResponse);
    }
  };

  /**
   * Send immediate message using TeamAlpha webhook (no auth required)
   */
  public sendWebhookMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body;

      if (!message) {
        res.status(400).json({
          success: false,
          error: 'Message is required'
        } as ApiResponse);
        return;
      }

      // Use TeamAlpha webhook directly
      const teamAlphaWebhook = 'https://hooks.slack.com/services/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';

      await this.slackService.sendWebhookMessage(teamAlphaWebhook, message);

      res.json({
        success: true,
        message: 'Message sent successfully to TeamAlpha workspace'
      } as ApiResponse);
    } catch (error) {
      console.error('Error sending webhook message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      } as ApiResponse);
    }
  };

  /**
   * Schedule a message for TeamAlpha webhook (no auth required)
   */
  public scheduleWebhookMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, scheduled_for } = req.body;

      if (!message || !scheduled_for) {
        res.status(400).json({
          success: false,
          error: 'Message and scheduled_for are required'
        } as ApiResponse);
        return;
      }

      // Create a scheduled message for TeamAlpha webhook
      const scheduledMessage = this.db.createScheduledMessage({
        id: uuidv4(),
        user_id: 'webhook-user', // Special user for webhook messages
        channel_id: 'teamalpha-webhook',
        channel_name: 'TeamAlpha Webhook',
        message,
        scheduled_for,
        status: 'pending'
      });

      res.json({
        success: true,
        data: {
          id: scheduledMessage.id,
          channel_name: 'TeamAlpha Workspace',
          message: scheduledMessage.message,
          scheduled_for: scheduledMessage.scheduled_for,
          status: scheduledMessage.status
        },
        message: 'Message scheduled successfully for TeamAlpha workspace'
      } as ApiResponse);
    } catch (error) {
      console.error('Error scheduling webhook message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule message'
      } as ApiResponse);
    }
  };

  /**
   * Get all scheduled webhook messages (no auth required)
   */
  public getWebhookScheduledMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get all scheduled messages for webhook user
      const scheduledMessages = this.db.getScheduledMessagesByUserId('webhook-user');

      res.json({
        success: true,
        data: scheduledMessages.map(msg => ({
          id: msg.id,
          message: msg.message,
          scheduled_for: msg.scheduled_for,
          status: msg.status,
          created_at: msg.created_at,
          sent_at: msg.sent_at,
          error_message: msg.error_message,
          // Convert timestamps to readable dates for UI - handle both string and number formats
          scheduled_for_readable: typeof msg.scheduled_for === 'string' ? msg.scheduled_for : new Date(msg.scheduled_for * 1000).toISOString(),
          created_at_readable: typeof msg.created_at === 'string' ? msg.created_at : new Date(msg.created_at * 1000).toISOString(),
          sent_at_readable: msg.sent_at ? (typeof msg.sent_at === 'string' ? msg.sent_at : new Date(msg.sent_at * 1000).toISOString()) : null
        })),
        message: 'Scheduled messages retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting webhook scheduled messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scheduled messages'
      } as ApiResponse);
    }
  };

  /**
   * Cancel a scheduled webhook message (no auth required)
   */
  public cancelWebhookScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Message ID is required'
        } as ApiResponse);
        return;
      }

      // Get the message to verify it's a webhook message and exists
      const scheduledMessages = this.db.getScheduledMessagesByUserId('webhook-user');
      const message = scheduledMessages.find(msg => msg.id === id);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Scheduled message not found'
        } as ApiResponse);
        return;
      }

      if (message.status !== 'pending') {
        res.status(400).json({
          success: false,
          error: `Cannot cancel message with status: ${message.status}`
        } as ApiResponse);
        return;
      }

      // Cancel the message
      this.db.updateScheduledMessage(id, {
        status: 'cancelled'
      });

      res.json({
        success: true,
        message: 'Scheduled message cancelled successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error cancelling webhook scheduled message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel scheduled message'
      } as ApiResponse);
    }
  };

  /**
   * Update a scheduled webhook message (no auth required)
   */
  public updateWebhookScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { message, scheduled_for } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Message ID is required'
        } as ApiResponse);
        return;
      }

      // Get the message to verify it's a webhook message and exists
      const scheduledMessages = this.db.getScheduledMessagesByUserId('webhook-user');
      const existingMessage = scheduledMessages.find(msg => msg.id === id);

      if (!existingMessage) {
        res.status(404).json({
          success: false,
          error: 'Scheduled message not found'
        } as ApiResponse);
        return;
      }

      if (existingMessage.status !== 'pending') {
        res.status(400).json({
          success: false,
          error: `Cannot update message with status: ${existingMessage.status}`
        } as ApiResponse);
        return;
      }

      // Prepare updates
      const updates: any = {};
      if (message) updates.message = message;
      if (scheduled_for) updates.scheduled_for = scheduled_for;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid fields to update (message, scheduled_for)'
        } as ApiResponse);
        return;
      }

      // Update the message
      this.db.updateScheduledMessage(id, updates);

      // Get updated message
      const updatedMessages = this.db.getScheduledMessagesByUserId('webhook-user');
      const updatedMessage = updatedMessages.find(msg => msg.id === id);

      res.json({
        success: true,
        data: {
          id: updatedMessage!.id,
          message: updatedMessage!.message,
          scheduled_for: updatedMessage!.scheduled_for,
          status: updatedMessage!.status,
          scheduled_for_readable: typeof updatedMessage!.scheduled_for === 'string' ? updatedMessage!.scheduled_for : new Date(updatedMessage!.scheduled_for * 1000).toISOString()
        },
        message: 'Scheduled message updated successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating webhook scheduled message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update scheduled message'
      } as ApiResponse);
    }
  };
}

export default MessageController;
