import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/register', (req: Request, res: Response): void =>{
  if (!req.body.firstName) {
    res.status(400).json('You need to pass first name');
  }
  res.status(201).json({ message: 'User is Created' });
});

export default router;