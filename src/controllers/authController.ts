import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import AuthService from '../services/authService';
import SlackService from '../services/slackService';
import DatabaseManager from '../models/database';
import { ApiResponse, SlackOAuthResponse, User } from '../models/types';

// Ensure environment variables are loaded
dotenv.config();

class AuthController {
  private authService: AuthService;
  private slackService: SlackService;
  private db: DatabaseManager;

  constructor() {
    this.authService = new AuthService();
    this.slackService = new SlackService();
    this.db = new DatabaseManager();

    // Log configuration for debugging
    console.log('🔧 AuthController initialized');
    console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
    console.log('🔗 Slack Redirect URI:', process.env.SLACK_REDIRECT_URI);
    console.log('🔑 Slack Client ID present:', !!process.env.SLACK_CLIENT_ID);
    console.log('🔒 Slack Client Secret present:', !!process.env.SLACK_CLIENT_SECRET);
  }

  /**
   * Initiate Slack OAuth flow
   */
  public initiateSlackAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const state = this.authService.generateState();
      const authUrl = this.slackService.getAuthUrl(state);

      // Store state in session or return it to frontend for verification
      res.json({
        success: true,
        data: {
          auth_url: authUrl,
          state
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Error initiating Slack auth:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate authentication'
      } as ApiResponse);
    }
  };

  /**
   * Handle Slack OAuth callback
   */
  public handleSlackCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, error } = req.query;

      console.log('🔄 Handling OAuth callback...');
      console.log('🔑 Code present:', !!code);
      console.log('🎲 State:', state);
      console.log('❌ Error:', error);

      if (error) {
        console.error('OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=${encodeURIComponent(error as string)}`);
        return;
      }

      if (!code) {
        console.error('No code provided in callback');
        res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=no_code`);
        return;
      }

      // Exchange code for tokens
      console.log('🔄 Exchanging code for tokens...');
      const oauthResponse: SlackOAuthResponse = await this.slackService.exchangeCodeForToken(code as string);

      console.log('✅ OAuth exchange successful');
      console.log('🎯 Team ID:', oauthResponse.team?.id);
      console.log('👤 Authed user ID:', oauthResponse.authed_user?.id);
      console.log('🔑 Bot access token present:', !!oauthResponse.access_token);
      console.log('🔑 User access token present:', !!oauthResponse.authed_user?.access_token);
      console.log('🪝 Webhook URL present:', !!oauthResponse.incoming_webhook?.url);

      // Use the bot token for API calls (has more permissions)
      const botToken = oauthResponse.access_token;
      const userToken = oauthResponse.authed_user.access_token;
      const webhookUrl = oauthResponse.incoming_webhook?.url;

      // Get user info directly from OAuth response (more reliable)
      console.log('👤 Getting user info from OAuth response...');
      const userId = oauthResponse.authed_user.id;

      // Create a minimal user object from OAuth data
      const slackUser = {
        id: userId,
        team_id: oauthResponse.team.id,
        name: userId, // We'll use ID as name since we don't have display name
        // Add other required fields with defaults
        deleted: false,
        color: '',
        real_name: userId,
        tz: '',
        tz_label: '',
        tz_offset: 0,
        profile: {
          avatar_hash: '',
          status_text: '',
          status_emoji: '',
          real_name: userId,
          display_name: userId,
          real_name_normalized: userId,
          display_name_normalized: userId,
          image_24: '',
          image_32: '',
          image_48: '',
          image_72: '',
          image_192: '',
          image_512: '',
          team: oauthResponse.team.id
        },
        is_admin: false,
        is_owner: false,
        is_primary_owner: false,
        is_restricted: false,
        is_ultra_restricted: false,
        is_bot: false,
        updated: Date.now(),
        is_app_user: false,
        has_2fa: false
      };

      console.log('✅ User info retrieved from OAuth:', slackUser.id);

      // Check if user already exists
      let user = this.db.getUserBySlackId(slackUser.id);

      if (user) {
        console.log('👤 Updating existing user...');
        // Update existing user's tokens and webhook
        this.db.updateUser(user.id, {
          access_token: botToken, // Store bot token for message sending
          team_id: oauthResponse.team.id,
          webhook_url: webhookUrl,
          token_expires_at: undefined // Slack tokens don't have explicit expiry
        });

        // Refetch updated user
        user = this.db.getUserById(user.id)!;
      } else {
        console.log('👤 Creating new user...');
        // Create new user
        user = this.db.createUser({
          id: uuidv4(),
          slack_user_id: slackUser.id,
          team_id: oauthResponse.team.id,
          access_token: botToken, // Store bot token for message sending
          refresh_token: undefined, // Slack doesn't provide refresh tokens
          webhook_url: webhookUrl,
          token_expires_at: undefined
        });
      }

      // Generate JWT token
      console.log('🔐 Generating JWT token...');
      const jwtToken = this.authService.generateToken(user);

      // Redirect to frontend with token
      console.log('🔄 Redirecting to frontend...');
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwtToken}`);
    } catch (error) {
      console.error('❌ Error handling Slack callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=callback_failed`);
    }
  };

  /**
   * Get current user info
   */
  public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!; // Guaranteed by auth middleware

      // Test if Slack token is still valid
      const isValidToken = await this.slackService.testToken(user.access_token);

      res.json({
        success: true,
        data: {
          id: user.id,
          slack_user_id: user.slack_user_id,
          team_id: user.team_id,
          token_valid: isValidToken,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user information'
      } as ApiResponse);
    }
  };

  /**
   * Refresh user's Slack token status
   */
  public refreshTokenStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;

      const isValidToken = await this.slackService.testToken(user.access_token);

      res.json({
        success: true,
        data: {
          token_valid: isValidToken
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Error refreshing token status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check token status'
      } as ApiResponse);
    }
  };

  /**
   * Logout user (invalidate JWT on frontend)
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    // For JWT, we just return success - the frontend should remove the token
    res.json({
      success: true,
      message: 'Successfully logged out'
    } as ApiResponse);
  };
}

export default AuthController;
