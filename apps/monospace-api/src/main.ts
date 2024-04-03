import dotenv from 'dotenv';
import mongoose from 'mongoose';
import createServer from './services/server';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGO_URI = process.env.MONGO_URI ? String(process.env.MONGO_URI) : '';

const app = createServer();

// Connect to MongoDB
const db = mongoose.connect(MONGO_URI);
db.then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(err);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
