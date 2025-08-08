// User types
export interface User {
  id: string;
  slack_user_id: string;
  team_id: string;
  access_token: string;
  refresh_token?: string;
  webhook_url?: string;
  token_expires_at?: number;
  created_at: number;
  updated_at: number;
}

// Scheduled message types
export interface ScheduledMessage {
  id: string;
  user_id: string;
  channel_id: string;
  channel_name: string;
  message: string;
  scheduled_for: number;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  created_at: number;
  sent_at?: number;
  error_message?: string;
}

// Slack API types
export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
  is_archived: boolean;
  is_general: boolean;
  is_shared: boolean;
  is_member: boolean;
  // Additional Slack API properties
  created?: number;
  unlinked?: number;
  name_normalized?: string;
  is_ext_shared?: boolean;
  is_org_shared?: boolean;
  pending_shared?: any[];
  pending_connected_team_ids?: string[];
  is_pending_ext_shared?: boolean;
  topic?: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose?: {
    value: string;
    creator: string;
    last_set: number;
  };
  num_members?: number;
}

export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color: string;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: {
    avatar_hash: string;
    status_text: string;
    status_emoji: string;
    real_name: string;
    display_name: string;
    real_name_normalized: string;
    display_name_normalized: string;
    email?: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    team: string;
  };
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  updated: number;
  is_app_user: boolean;
  has_2fa: boolean;
}

// OAuth types
export interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id?: string;
  app_id: string;
  team: {
    id: string;
    name: string;
  };
  enterprise?: {
    id: string;
    name: string;
  };
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  incoming_webhook?: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
}

// API Request/Response types
export interface SendMessageRequest {
  channel_id: string;
  message: string;
}

export interface ScheduleMessageRequest {
  channel_id: string;
  channel_name: string;
  message: string;
  scheduled_for: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// JWT Payload type
export interface JWTPayload {
  user_id: string;
  slack_user_id: string;
  team_id: string;
  iat?: number;
  exp?: number;
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
