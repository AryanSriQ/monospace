import { Router } from 'express';
import authRoutes from './authentication';
import profileRoutes from './profile';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

// If no route matches, send the index file

export default router;
