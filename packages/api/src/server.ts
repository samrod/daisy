import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const envFile = `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`;
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

import firebaseRoutes from './firebaseRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', firebaseRoutes);

app.get('/', (req, res) => {
  res.send('Daisy API is running');
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
