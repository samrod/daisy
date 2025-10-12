import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const envFile = `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`;
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });
dotenv.config({ path: path.resolve(__dirname, '../', envFile) });

import { initAdmin } from './utils';
import firebaseRoutes from './firebaseRoutes';

initAdmin();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(`${process.env.API_PATH}`, firebaseRoutes);

app.get('/', (req, res) => {
  res.send('*** Daisy API is running');
});

app.use((req, res, next) => {
  console.log(`*** Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use((req, res) => {
  console.log('Unhandled request:', req.method, req.url);
  res.status(404).send('<h1>Not found</h1>');
});

app.listen(PORT, () => {
  console.log(`*** API server running on http://localhost:${PORT}`);
});
