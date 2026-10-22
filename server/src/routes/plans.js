import { Router } from 'express';
import { generateStudyPlan } from '../services/plannerService.js';
import { store } from '../db/store.js';

const router = Router();

// POST /api/plans
router.post('/', (req, res) => {
  try {
    const { availableMinutes, breakIntervalMinutes, breakDurationMinutes, filterSubject } = req.body;
    const plan = generateStudyPlan({
      availableMinutes: Number(availableMinutes) || 240,
      breakIntervalMinutes: Number(breakIntervalMinutes) || 75,
      breakDurationMinutes: Number(breakDurationMinutes) || 15,
      filterSubject,
    });
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/plans
router.get('/', (req, res) => {
  const plans = store.getPlans();
  res.json({ success: true, count: plans.length, plans });
});

// GET /api/plans/:id
router.get('/:id', (req, res) => {
  const plan = store.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }
  res.json({ success: true, plan });
});

export default router;
