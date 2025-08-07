import axios, { AxiosResponse } from 'axios';
import { SlackOAuthResponse, SlackChannel, SlackUser } from '../models/types';

class SlackService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.SLACK_CLIENT_ID!;
    this.clientSecret = process.env.SLACK_CLIENT_SECRET!;
    this.redirectUri = process.env.SLACK_REDIRECT_URI!;

    console.log('🔧 SlackService initialized');
    console.log('🔑 Client ID:', this.clientId ? `${this.clientId.substring(0, 10)}...` : 'MISSING');
    console.log('🔒 Client Secret:', this.clientSecret ? 'Present' : 'MISSING');
    console.log('🔗 Redirect URI:', this.redirectUri);

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      const missing = [];
      if (!this.clientId) missing.push('SLACK_CLIENT_ID');
      if (!this.clientSecret) missing.push('SLACK_CLIENT_SECRET');
      if (!this.redirectUri) missing.push('SLACK_REDIRECT_URI');

      console.error('❌ Missing Slack configuration:', missing.join(', '));
      throw new Error(`Missing required Slack configuration: ${missing.join(', ')}`);
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'channels:read,chat:write,users:read,incoming-webhook',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      user_scope: 'identity.basic,identity.email', // User token scopes
    });

    if (state) {
      params.append('state', state);
    }

    const authUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`;
    console.log('🔗 Generated auth URL:', authUrl);

    return authUrl;
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    try {
      console.log('🔄 Exchanging OAuth code for token...');
      console.log('🔑 Client ID:', this.clientId ? `${this.clientId.substring(0, 10)}...` : 'MISSING');
      console.log('🔗 Redirect URI:', this.redirectUri);

      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri,
      });

      const response: AxiosResponse<SlackOAuthResponse> = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('📋 OAuth response status:', response.status);
      console.log('📋 OAuth response ok:', response.data.ok);

      if (!response.data.ok) {
        console.error('❌ OAuth exchange failed:', response.data);
        throw new Error(`OAuth exchange failed: ${JSON.stringify(response.data)}`);
      }

      console.log('✅ OAuth exchange successful');
      return response.data;
    } catch (error) {
      console.error('❌ Error exchanging OAuth code:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Response data:', error.response?.data);
        console.error('📋 Response status:', error.response?.status);
      }
      throw new Error('Failed to exchange OAuth code for token');
    }
  }

  /**
   * Get user information from Slack
   */
  async getUserInfo(accessToken: string): Promise<SlackUser> {
    try {
      console.log('👤 Getting user info...');
      console.log('🔑 Access token present:', !!accessToken);

      // First, get the current user's ID
      const authResponse = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('🔍 Auth test response:', authResponse.data);

      if (!authResponse.data.ok) {
        throw new Error(`Failed to test auth: ${authResponse.data.error}`);
      }

      const userId = authResponse.data.user_id;
      console.log('👤 User ID:', userId);

      // Now get the user's detailed information
      const response = await axios.get('https://slack.com/api/users.info', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          user: userId,
        },
      });

      console.log('📋 User info response status:', response.status);
      console.log('📋 User info response ok:', response.data.ok);

      if (!response.data.ok) {
        console.error('❌ Failed to get user info:', response.data);
        throw new Error(`Failed to get user info: ${response.data.error}`);
      }

      console.log('✅ User info retrieved successfully');
      return response.data.user;
    } catch (error) {
      console.error('❌ Error getting user info:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Response data:', error.response?.data);
        console.error('📋 Response status:', error.response?.status);
      }
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Get list of channels for the user
   */
  async getChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      const response = await axios.get('https://slack.com/api/conversations.list', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: 100,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Failed to get channels: ${response.data.error}`);
      }

      // Filter channels where the user is a member
      const channels = response.data.channels.filter((channel: SlackChannel) =>
        channel.is_member && !channel.is_archived
      );

      return channels;
    } catch (error) {
      console.error('Error getting channels:', error);
      throw new Error('Failed to get channels');
    }
  }

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(accessToken: string, channelId: string, text: string): Promise<void> {
    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: channelId,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`Failed to send message: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Send a message using webhook URL (simpler alternative)
   */
  async sendWebhookMessage(webhookUrl: string, text: string): Promise<void> {
    try {
      console.log('🪝 Sending webhook message...');
      const response = await axios.post(webhookUrl, {
        text: text
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      console.log('✅ Webhook message sent successfully');
    } catch (error) {
      console.error('❌ Error sending webhook message:', error);
      throw new Error('Failed to send webhook message');
    }
  }

  /**
   * Test if a token is valid
   */
  async testToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.ok;
    } catch (error) {
      console.error('Error testing token:', error);
      return false;
    }
  }

  /**
   * Refresh access token (if using refresh tokens in the future)
   */
  async refreshToken(refreshToken: string): Promise<SlackOAuthResponse> {
    try {
      const response: AxiosResponse<SlackOAuthResponse> = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`Token refresh failed: ${JSON.stringify(response.data)}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }
}

export default SlackService;
