import { Request, Response, Router } from 'express';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();
const router = Router();

router.post('/*', async (req: Request, res: Response) => {
  const path = req.params[0];
  const { data } = req.body;
  try {
    const ref = db.ref(path);
    await ref.set(data);
    // console.log('*** POST request to:', req.params[0], 'with body:', req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:collection/:id', async (req: Request, res: Response) => {
  const { collection, id } = req.params;
  try {
    const ref = db.ref(`${collection}/${id}`);
    await ref.remove();
    res.json({ success: true });
  } catch (err) {
  res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
