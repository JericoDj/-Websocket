import express from 'express';
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';

const matchesRouter = express.Router();

const MAX_LIMIT = 100;

console.log("🔥 MATCHES ROUTER LOADED 🔥");

matchesRouter.get('/', (req, res) => {
    res.send('Matches route');
});

matchesRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid request body", details: parsed.error.issues
        });
    }

    const { data: { startTime, endTime } } = parsed;

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: 0,
            awayScore: 0,
            status: 'scheduled',
        }).returning();


        if (res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated(event);
        }

        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Failed to create match', details: error.message });
    }

});


matchesRouter.get('/list', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query parameters", details: parsed.error.issues
        });
    }
    const limit = Math.min(parsed.data.limit || MAX_LIMIT, MAX_LIMIT);
    try {
        const data = await db.select().from(matches).limit(limit);
        res.json(data);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches', details: error.message });
    }
});

export default matchesRouter;