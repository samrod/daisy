import 'dotenv-flow/config';
import express, { Request, Response } from "express";
import cors from "cors";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/charge', async (req: Request, res: Response) => {
  const { amount, source } = req.body;
  console.log("*** Stripe: ", req.body);
  try {
    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      source,
    });

    res.status(200).json(charge);
  } catch (error: any) {
    console.error('Stripe charge error:', error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = import.meta.env.API_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
});
