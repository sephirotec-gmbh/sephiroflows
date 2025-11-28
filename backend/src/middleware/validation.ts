import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    companyName: Joi.string().required(),
  }),
  
  createWorkflow: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    nodes: Joi.array().default([]),
    edges: Joi.array().default([]),
    settings: Joi.object().default({}),
  }),
  
  updateWorkflow: Joi.object({
    name: Joi.string(),
    description: Joi.string().allow(''),
    nodes: Joi.array(),
    edges: Joi.array(),
    settings: Joi.object(),
    status: Joi.string().valid('draft', 'active', 'paused'),
  }),
  
  executeWorkflow: Joi.object({
    triggerData: Joi.object().default({}),
  }),
};
