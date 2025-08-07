import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import AuthService from '../services/authService';
import DatabaseManager from '../models/database';

// Ensure environment variables are loaded
dotenv.config();

const authService = new AuthService();
const db = new DatabaseManager();

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = authService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    const decoded = authService.verifyToken(token);
    const user = db.getUserById(decoded.user_id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = authService.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = authService.verifyToken(token);
      const user = db.getUserById(decoded.user_id);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Don't fail if token is invalid, just proceed without user
    next();
  }
};
