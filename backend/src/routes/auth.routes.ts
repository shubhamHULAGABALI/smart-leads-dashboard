import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { handleValidationErrors } from '../middleware/error.middleware';

const router = Router();

router.post('/register', registerValidator, handleValidationErrors, authController.register);
router.post('/login',    loginValidator,    handleValidationErrors, authController.login);
router.get('/me',        authenticate,                              authController.getMe);

export default router;
