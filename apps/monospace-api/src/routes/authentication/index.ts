import { Router } from 'express';
import {
  forgotPassword,
  login,
  register,
  resendVerificationEmail,
  resetPassword,
  verify,
} from '../../controllers';

const router = Router();

// register
router.post('/register', register);

// verify
router.get('/verify/:token', verify);

// login
router.post('/login', login);

// forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password/:token', resetPassword);

// resend verification email
router.post('/resend-verification-email', resendVerificationEmail);

export default router;
