import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import analyzeRouter from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/analyze', analyzeRouter);

// Health Check
app.get('/', (req, res) => {
  res.send('Burnout Analyzer API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});