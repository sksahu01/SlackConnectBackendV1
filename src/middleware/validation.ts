import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  sendMessage: Joi.object({
    channel_id: Joi.string().required().messages({
      'any.required': 'Channel ID is required',
      'string.empty': 'Channel ID cannot be empty'
    }),
    message: Joi.string().required().max(4000).messages({
      'any.required': 'Message is required',
      'string.empty': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 4000 characters'
    })
  }),

  scheduleMessage: Joi.object({
    channel_id: Joi.string().required().messages({
      'any.required': 'Channel ID is required',
      'string.empty': 'Channel ID cannot be empty'
    }),
    channel_name: Joi.string().required().messages({
      'any.required': 'Channel name is required',
      'string.empty': 'Channel name cannot be empty'
    }),
    message: Joi.string().required().max(4000).messages({
      'any.required': 'Message is required',
      'string.empty': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 4000 characters'
    }),
    scheduled_for: Joi.number().integer().min(Math.floor(Date.now() / 1000)).required().messages({
      'any.required': 'Scheduled time is required',
      'number.base': 'Scheduled time must be a number',
      'number.integer': 'Scheduled time must be an integer',
      'number.min': 'Scheduled time cannot be in the past'
    })
  })
};
