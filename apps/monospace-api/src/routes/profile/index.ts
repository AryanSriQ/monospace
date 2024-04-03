import { Router } from 'express';
import { profile } from '../../controllers';
import jwtAuthCookie from '../../middleware/jwtAuthCookie';

const router = Router();

router.use(jwtAuthCookie);

router.get('/', profile);

export default router;
