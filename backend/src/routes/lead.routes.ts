import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createLeadValidator, updateLeadValidator } from '../validators/lead.validator';
import { handleValidationErrors } from '../middleware/error.middleware';

const router = Router();

// All lead routes require a valid JWT
router.use(authenticate);

router.get('/stats',     leadController.getStats);
router.get('/analytics', leadController.getAnalytics);
router.get('/export', leadController.exportLeads);

router.get('/',       leadController.getLeads);
router.post('/',      createLeadValidator, handleValidationErrors, leadController.createLead);
router.get('/:id',    leadController.getLead);
router.put('/:id',    updateLeadValidator, handleValidationErrors, leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

export default router;
