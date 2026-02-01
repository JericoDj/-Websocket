import { db } from './db/db.js';
import { matches, commentary } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        console.log('🏁 Starting Demo...');

        // 1. Create a Match
        console.log('Creating a new match...');
        const [newMatch] = await db.insert(matches).values({
            sport: 'Soccer',
            homeTeam: 'Red United',
            awayTeam: 'Blue City',
            status: 'scheduled',
            startTime: new Date(Date.now() + 3600000), // 1 hour from now
        }).returning();
        console.log('✅ Match Created:', newMatch);

        // 2. Add Commentary
        console.log('Adding entry commentary...');
        const [entry] = await db.insert(commentary).values({
            matchId: newMatch.id,
            message: 'Match schedule confirmed.',
            eventType: 'info'
        }).returning();
        console.log('✅ Commentary Added:', entry);

        // 3. Update Match Status
        console.log('Updating match status to live...');
        const [updatedMatch] = await db.update(matches)
            .set({ status: 'live', startTime: new Date() })
            .where(eq(matches.id, newMatch.id))
            .returning();
        console.log('✅ Match Updated:', updatedMatch);

        // 4. Read Match with Commentary (Simple separte queries for demo)
        const matchResult = await db.select().from(matches).where(eq(matches.id, newMatch.id));
        const commResult = await db.select().from(commentary).where(eq(commentary.matchId, newMatch.id));

        console.log('🔍 Final Details:');
        console.log('Match:', matchResult[0]);
        console.log('Commentary:', commResult);

        console.log('🎉 Demo Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Demo Failed:', err);
        process.exit(1);
    }
}

main();
