const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().max(30).optional(),
    householdName: Joi.string().min(2).max(120).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  asset: Joi.object({
    asset_type_id: Joi.number().integer().min(1).required(),
    display_name: Joi.string().min(1).max(120).required(),
    acquisition_dt: Joi.date().optional(),
    current_value: Joi.number().precision(2).optional(),
    purchase_price: Joi.alternatives().try(
      Joi.number().precision(2),
      Joi.string().allow('')
    ).optional(),
    currency: Joi.string().length(3).default('INR'),
    notes: Joi.string().optional(),
    details: Joi.object().optional()
  }),

  transaction: Joi.object({
    asset_id: Joi.number().integer().optional(),
    category_id: Joi.number().integer().required(),
    purpose: Joi.string().max(160).optional(),
    txn_type: Joi.string().valid('income', 'expense', 'transfer').required(),
    amount: Joi.number().precision(2).positive().required(),
    currency: Joi.string().length(3).default('INR'),
    txn_date: Joi.date().required(),
    notes: Joi.string().optional()
  }),

  budget: Joi.object({
    category_id: Joi.number().integer().required(),
    period_start: Joi.date().required(),
    period_end: Joi.date().required(),
    planned_amount: Joi.number().precision(2).positive().required()
  })
};

module.exports = {
  validateRequest,
  schemas
};
