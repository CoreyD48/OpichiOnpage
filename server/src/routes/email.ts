import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  console.log('Email submitted for unlock:', email);

  res.json({ success: true, message: 'Email saved successfully' });
});

export default router;
