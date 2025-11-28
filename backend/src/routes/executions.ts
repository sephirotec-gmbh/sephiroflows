import express from 'express';
import { listExecutions, getExecution, getExecutionLogs } from '../controllers/executionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', listExecutions);
router.get('/:id', getExecution);
router.get('/:id/logs', getExecutionLogs);

export default router;
