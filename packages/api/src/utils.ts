import admin from "firebase-admin";
import { Request, Response } from "express";

export let db: admin.database.Database;
export const initAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  db = admin.database();
};


export const authenticatedCollections = ["presets", "links", "sessions", "guides"];

export const handlePost = async (req: Request, res: Response) => {
  const { data } = req.body;
  try {
    const ref = getFullRef(req.params);
    await ref.set(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handleDelete = async (req: Request, res: Response) => {
  try {
    const ref = getFullRef(req.params);
    await ref.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handlers = { post: handlePost, delete: handleDelete };

export type Method = 'post' | 'delete';

export const getFullRef = (params: any) => {
  const { collection, id } = params;
  const rest = params[0] ? `/${params[0]}` : '';
  const fullPath = collection && id ? `${collection}/${id}${rest}` : collection || '';
  return db.ref(fullPath);
};

