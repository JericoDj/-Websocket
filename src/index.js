import express from 'express';
import { createServer } from 'node:http';
import matchesRouter from './routes/matches.js';
import { attachWebSocketServer } from './ws/server.js';

const app = express();
const port = 2000;

app.use(express.json());

console.log("🔥 RUNNING src/index.js 🔥");

const server = createServer(app);
const { broadcastMatchStatus, broadcastMatchCreated } = attachWebSocketServer(server);

app.locals.broadcastMatchStatus = broadcastMatchStatus;
app.locals.broadcastMatchCreated = broadcastMatchCreated;

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.use('/matches', matchesRouter);

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`WebSocket server listening at ws://localhost:${port}/ws`);
});

