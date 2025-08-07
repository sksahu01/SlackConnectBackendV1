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
}

export default MessageController;
