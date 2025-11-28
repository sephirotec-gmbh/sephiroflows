import express from 'express';
import { listNodes, getNode } from '../controllers/nodeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', listNodes);
router.get('/:type', getNode);

export default router;
