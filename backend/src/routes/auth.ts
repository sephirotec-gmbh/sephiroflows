import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
