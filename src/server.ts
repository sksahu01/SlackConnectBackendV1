import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';
import SchedulerService from './services/schedulerService';

// Load environment variables
dotenv.config();

class Server {
  private app: express.Application;
  private port: number;
  private scheduler: SchedulerService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.scheduler = new SchedulerService();

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for API
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
      this.app.use(requestLogger);
    } else {
      this.app.use(morgan('combined'));
    }
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Slack Connect API',
        version: '1.0.0',
        documentation: '/api/health'
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    this.app.listen(this.port, host, () => {
      console.log(`🚀 Server running on ${host}:${this.port}`);
      console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);

      if (process.env.NODE_ENV === 'production') {
        console.log(`🔗 API URL: https://slack-connect-backend.onrender.com/api`);
      } else {
        console.log(`🔗 API URL: http://localhost:${this.port}/api`);
      }

      // Start the message scheduler
      this.scheduler.start();
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  private gracefulShutdown(): void {
    console.log('🛑 Shutting down gracefully...');

    // Stop the scheduler
    this.scheduler.stop();

    process.exit(0);
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;
