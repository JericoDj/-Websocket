import express from 'express';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { matchIdParamSchema } from '../validation/matches.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';

const commentaryRouter = express.Router({ mergeParams: true });

commentaryRouter.post('/:id/commentary', async (req, res) => {
    try {
        // Validate params (match ID)
        const paramsParsed = matchIdParamSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            return res.status(400).json({
                error: "Invalid match ID",
                details: paramsParsed.error.issues
            });
        }
        const matchId = paramsParsed.data.id;

        // Validate body
        const bodyParsed = createCommentarySchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: bodyParsed.error.issues
            });
        }

        // Insert into database
        const [newCommentary] = await db.insert(commentary).values({
            matchId,
            ...bodyParsed.data
        }).returning();

        res.status(201).json(newCommentary);

    } catch (error) {
        console.error('Error creating commentary:', error);
        res.status(500).json({ error: 'Failed to create commentary' });
    }
});

import { listCommentaryQuerySchema } from '../validation/commentary.js';
import { desc, eq } from 'drizzle-orm';

const MAX_LIMIT = 100;

commentaryRouter.get('/:id/commentary', async (req, res) => {
    try {
        // Validate params (match ID)
        const paramsParsed = matchIdParamSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            return res.status(400).json({
                error: "Invalid match ID",
                details: paramsParsed.error.issues
            });
        }
        const matchId = paramsParsed.data.id;

        // Validate query
        const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
        if (!queryParsed.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: queryParsed.error.issues
            });
        }

        const limit = Math.min(queryParsed.data.limit || 100, MAX_LIMIT);

        const data = await db.select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        res.json(data);

    } catch (error) {
        console.error('Error fetching commentary:', error);
        res.status(500).json({ error: 'Failed to fetch commentary' });
    }
});

export default commentaryRouter;
