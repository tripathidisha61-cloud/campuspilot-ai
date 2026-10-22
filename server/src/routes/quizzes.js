import { Router } from 'express';
import { generateQuiz, submitQuiz } from '../services/quizService.js';
import { store } from '../db/store.js';

const router = Router();

// POST /api/quizzes (generate quiz)
router.post('/', async (req, res) => {
  try {
    const { topic, questionCount, difficulty } = req.body;
    const quiz = await generateQuiz({
      topic: topic || 'Database normalization',
      questionCount: Number(questionCount) || 5,
      difficulty: difficulty || 'medium',
    });
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/quizzes
router.get('/', (req, res) => {
  const attempts = store.getQuizzes();
  res.json({ success: true, count: attempts.length, attempts });
});

// GET /api/quizzes/:id
router.get('/:id', (req, res) => {
  const quiz = store.getQuizById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }
  res.json({ success: true, quiz });
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'answers must be an array of numbers' });
    }
    const result = submitQuiz(req.params.id, answers);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
