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
      scope: 'channels:read,chat:write,users:read',
      redirect_uri: this.redirectUri,
      response_type: 'code',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    try {
      const response: AxiosResponse<SlackOAuthResponse> = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`OAuth exchange failed: ${JSON.stringify(response.data)}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error exchanging OAuth code:', error);
      throw new Error('Failed to exchange OAuth code for token');
    }
  }

  /**
   * Get user information from Slack
   */
  async getUserInfo(accessToken: string): Promise<SlackUser> {
    try {
      const response = await axios.get('https://slack.com/api/users.info', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          user: 'me',
        },
      });

      if (!response.data.ok) {
        throw new Error(`Failed to get user info: ${response.data.error}`);
      }

      return response.data.user;
    } catch (error) {
      console.error('Error getting user info:', error);
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
