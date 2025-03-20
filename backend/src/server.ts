import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './router/index.routes';


dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const MONGO_URI = String(process.env.MONGO_URI)


// Middleware
app.use(express.json());
app.use(cors());


app.use("/api/v1/", router);


// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
