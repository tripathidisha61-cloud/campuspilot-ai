import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/tasks
router.get('/', (req, res) => {
  const { status, subject } = req.query;
  const tasks = store.getTasks({ status, subject });
  res.json({ success: true, count: tasks.length, tasks });
});

// POST /api/tasks
router.post('/', (req, res) => {
  try {
    const task = store.createTask(req.body);
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const updated = store.updateTask(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, task: updated });
});

// POST /api/tasks/:id/complete
router.post('/:id/complete', (req, res) => {
  const completed = store.completeTask(req.params.id);
  if (!completed) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, task: completed });
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const success = store.deleteTask(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, message: 'Task deleted successfully' });
});

export default router;
