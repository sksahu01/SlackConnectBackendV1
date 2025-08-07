import Database from 'better-sqlite3';
import path from 'path';
import { User, ScheduledMessage } from './types';

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/slack-connect.db');

    // Ensure database directory exists
    const fs = require('fs');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        slack_user_id TEXT UNIQUE NOT NULL,
        team_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Scheduled messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        channel_name TEXT NOT NULL,
        message TEXT NOT NULL,
        scheduled_for INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        sent_at INTEGER,
        error_message TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_slack_user_id ON users (slack_user_id);
      CREATE INDEX IF NOT EXISTS idx_scheduled_messages_user_id ON scheduled_messages (user_id);
      CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages (status);
      CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_for ON scheduled_messages (scheduled_for);
    `);

    console.log('Database tables initialized successfully');
  }

  // User operations
  createUser(user: Omit<User, 'created_at' | 'updated_at'>): User {
    const now = Math.floor(Date.now() / 1000);
    const stmt = this.db.prepare(`
      INSERT INTO users (id, slack_user_id, team_id, access_token, refresh_token, token_expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.slack_user_id,
      user.team_id,
      user.access_token,
      user.refresh_token,
      user.token_expires_at,
      now,
      now
    );

    return { ...user, created_at: now, updated_at: now };
  }

  getUserById(id: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  getUserBySlackId(slackUserId: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE slack_user_id = ?');
    return stmt.get(slackUserId) as User | undefined;
  }

  updateUser(id: string, updates: Partial<User>): void {
    const now = Math.floor(Date.now() / 1000);
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');

    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field as keyof User]);

    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${setClause}, updated_at = ? 
      WHERE id = ?
    `);

    stmt.run(...values, now, id);
  }

  // Scheduled message operations
  createScheduledMessage(message: Omit<ScheduledMessage, 'created_at'>): ScheduledMessage {
    const now = Math.floor(Date.now() / 1000);
    const stmt = this.db.prepare(`
      INSERT INTO scheduled_messages (id, user_id, channel_id, channel_name, message, scheduled_for, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.id,
      message.user_id,
      message.channel_id,
      message.channel_name,
      message.message,
      message.scheduled_for,
      message.status,
      now
    );

    return { ...message, created_at: now };
  }

  getScheduledMessagesByUserId(userId: string): ScheduledMessage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM scheduled_messages 
      WHERE user_id = ? 
      ORDER BY scheduled_for ASC
    `);
    return stmt.all(userId) as ScheduledMessage[];
  }

  getPendingMessages(): ScheduledMessage[] {
    const now = Math.floor(Date.now() / 1000);
    const stmt = this.db.prepare(`
      SELECT * FROM scheduled_messages 
      WHERE status = 'pending' AND scheduled_for <= ?
      ORDER BY scheduled_for ASC
    `);
    return stmt.all(now) as ScheduledMessage[];
  }

  updateScheduledMessage(id: string, updates: Partial<ScheduledMessage>): void {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');

    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field as keyof ScheduledMessage]);

    const stmt = this.db.prepare(`
      UPDATE scheduled_messages 
      SET ${setClause}
      WHERE id = ?
    `);

    stmt.run(...values, id);
  }

  deleteScheduledMessage(id: string, userId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM scheduled_messages WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  // Cleanup operations
  cleanupOldMessages(daysBefore: number = 30): number {
    const cutoffTime = Math.floor(Date.now() / 1000) - (daysBefore * 24 * 60 * 60);
    const stmt = this.db.prepare(`
      DELETE FROM scheduled_messages 
      WHERE (status = 'sent' OR status = 'cancelled') 
      AND created_at < ?
    `);
    const result = stmt.run(cutoffTime);
    return result.changes;
  }

  close(): void {
    this.db.close();
  }

  // Get database instance for transactions
  getDatabase(): Database.Database {
    return this.db;
  }
}

export default DatabaseManager;
