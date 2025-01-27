import { Router, Request, Response } from 'express';

const router = Router();

router.post('/soil-data', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;
    // ... rest of your soil data logic
  } catch (error) {
    console.error('Soil data error:', error);
    res.status(500).json({ error: 'Failed to fetch soil data' });
  }
}); 