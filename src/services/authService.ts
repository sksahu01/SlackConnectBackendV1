import * as jwt from 'jsonwebtoken';
import { JWTPayload, User } from '../models/types';

class AuthService {
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET!;
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
    }

    /**
     * Generate JWT token for authenticated user
     */
    generateToken(user: User): string {
        const payload = {
            user_id: user.id,
            slack_user_id: user.slack_user_id,
            team_id: user.team_id,
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    }

    /**
     * Verify and decode JWT token
     */
    verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.jwtSecret) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Extract token from Authorization header
     */
    extractTokenFromHeader(authHeader: string | undefined): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        return authHeader.slice(7); // Remove 'Bearer ' prefix
    }

    /**
     * Generate a secure random state for OAuth
     */
    generateState(): string {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }
}

export default AuthService;
