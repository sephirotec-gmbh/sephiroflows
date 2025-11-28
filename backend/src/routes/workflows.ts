import express from 'express';
import {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from '../controllers/workflowController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', listWorkflows);
router.get('/:id', getWorkflow);
router.post('/', requirePermission('canEditWorkflows'), validate(schemas.createWorkflow), createWorkflow);
router.put('/:id', requirePermission('canEditWorkflows'), validate(schemas.updateWorkflow), updateWorkflow);
router.delete('/:id', requirePermission('canEditWorkflows'), deleteWorkflow);
router.post('/:id/execute', requirePermission('canExecuteWorkflows'), validate(schemas.executeWorkflow), executeWorkflow);

export default router;
