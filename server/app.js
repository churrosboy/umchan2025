import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', usersRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
