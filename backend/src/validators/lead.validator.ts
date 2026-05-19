import { body, ValidationChain } from 'express-validator';

export const createLeadValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('Lead name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost'])
    .withMessage('Status must be one of: new, contacted, qualified, lost'),

  body('source')
    .notEmpty().withMessage('Source is required')
    .isIn(['website', 'instagram', 'referral'])
    .withMessage('Source must be one of: website, instagram, referral'),
];

export const updateLeadValidator: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost'])
    .withMessage('Status must be one of: new, contacted, qualified, lost'),

  body('source')
    .optional()
    .isIn(['website', 'instagram', 'referral'])
    .withMessage('Source must be one of: website, instagram, referral'),
];
