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
      user_scope: 'identity.basic,identity.email,identity.team,channels:read', // User token scopes
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
   * Get user information from Slack using bot token (more reliable)
   */
  async getUserInfoWithBotToken(botToken: string, userId: string): Promise<SlackUser> {
    try {
      console.log('👤 Getting user info with bot token...');
      console.log('🔑 Bot token present:', !!botToken);
      console.log('👤 User ID:', userId);

      // Get the user's detailed information using bot token
      const response = await axios.get('https://slack.com/api/users.info', {
        headers: {
          Authorization: `Bearer ${botToken}`,
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

      console.log('✅ User info retrieved successfully with bot token');
      return response.data.user;
    } catch (error) {
      console.error('❌ Error getting user info with bot token:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Response data:', error.response?.data);
        console.error('📋 Response status:', error.response?.status);
      }
      throw new Error('Failed to get user information with bot token');
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
   * Get list of channels using bot token (more reliable)
   */
  async getChannelsWithBotToken(botToken: string): Promise<SlackChannel[]> {
    try {
      console.log('📋 Getting channels with bot token...');
      console.log('🔑 Bot token present:', !!botToken);

      const response = await axios.get('https://slack.com/api/conversations.list', {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
        params: {
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: 1000, // Get more channels
        },
      });

      console.log('📋 Bot channels response status:', response.status);
      console.log('📋 Bot channels response ok:', response.data.ok);

      if (!response.data.ok) {
        console.error('❌ Failed to get channels with bot token:', response.data);
        throw new Error(`Failed to get channels: ${response.data.error}`);
      }

      const channels = response.data.channels || [];
      console.log('✅ Retrieved channels with bot token:', channels.length);

      // Return all accessible channels
      return channels.filter((channel: SlackChannel) => !channel.is_archived);
    } catch (error) {
      console.error('❌ Error getting channels with bot token:', error);
      throw error;
    }
  }

  /**
   * Get list of channels for the user
   */
  async getChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      console.log('📋 Getting channels...');
      console.log('🔑 Access token present:', !!accessToken);

      // First, try to get all conversations
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

      console.log('📋 Channels response status:', response.status);
      console.log('📋 Channels response ok:', response.data.ok);

      if (!response.data.ok) {
        console.error('❌ Failed to get channels:', response.data);

        // If we don't have permission to list channels, return a default channel list
        if (response.data.error === 'missing_scope' || response.data.error === 'not_authed') {
          console.log('⚠️ Insufficient permissions for channels.list, trying alternative approach...');

          // Try to get user's conversations (channels they're a member of)
          try {
            const userConversationsResponse = await axios.get('https://slack.com/api/users.conversations', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                types: 'public_channel,private_channel',
                exclude_archived: true,
                limit: 100,
              },
            });

            if (userConversationsResponse.data.ok) {
              console.log('✅ Retrieved user conversations successfully');
              return userConversationsResponse.data.channels || [];
            }
          } catch (conversationError) {
            console.error('❌ Failed to get user conversations:', conversationError);
          }

          // If all else fails, return a general channel option
          console.log('⚠️ Returning fallback channel options');
          return [
            {
              id: 'general',
              name: 'general',
              is_channel: true,
              is_group: false,
              is_im: false,
              is_mpim: false,
              is_private: false,
              created: Date.now() / 1000,
              is_archived: false,
              is_general: true,
              unlinked: 0,
              name_normalized: 'general',
              is_shared: false,
              is_ext_shared: false,
              is_org_shared: false,
              pending_shared: [],
              pending_connected_team_ids: [],
              is_member: true,
              is_pending_ext_shared: false,
              topic: { value: '', creator: '', last_set: 0 },
              purpose: { value: 'This is the #general channel', creator: '', last_set: 0 },
              num_members: 0
            }
          ];
        }

        throw new Error(`Failed to get channels: ${response.data.error}`);
      }

      console.log('📋 Found channels:', response.data.channels?.length || 0);

      // Return all channels (let frontend handle filtering if needed)
      const channels = response.data.channels || [];

      // Filter channels where the user is a member (if the property exists)
      const filteredChannels = channels.filter((channel: SlackChannel) => {
        // Some workspaces don't return is_member property, so we include all accessible channels
        return !channel.is_archived && (channel.is_member !== false);
      });

      console.log('✅ Filtered channels:', filteredChannels.length);
      return filteredChannels;
    } catch (error) {
      console.error('❌ Error getting channels:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Response data:', error.response?.data);
        console.error('📋 Response status:', error.response?.status);
      }

      // Return a fallback so the UI doesn't break
      console.log('⚠️ Returning fallback due to error');
      return [
        {
          id: 'general',
          name: 'general',
          is_channel: true,
          is_group: false,
          is_im: false,
          is_mpim: false,
          is_private: false,
          created: Date.now() / 1000,
          is_archived: false,
          is_general: true,
          unlinked: 0,
          name_normalized: 'general',
          is_shared: false,
          is_ext_shared: false,
          is_org_shared: false,
          pending_shared: [],
          pending_connected_team_ids: [],
          is_member: true,
          is_pending_ext_shared: false,
          topic: { value: '', creator: '', last_set: 0 },
          purpose: { value: 'This is the #general channel', creator: '', last_set: 0 },
          num_members: 0
        }
      ];
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
