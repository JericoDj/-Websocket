import express from 'express';
import matchesRouter from './routes/matches.js';
const app = express();
const port = 2000;

app.use(express.json());

console.log("🔥 RUNNING src/index.js 🔥");
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.use('/matches', matchesRouter);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

