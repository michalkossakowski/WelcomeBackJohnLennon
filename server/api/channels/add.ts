import fs from 'fs/promises';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const data = await fs.readFile('./db/channels.json', 'utf8');
        const channels = JSON.parse(data);

        channels.push({
            id: body.id,
            serverId: body.serverId,
            title: body.title,
            creatorId: body.creatorId
        });

        await fs.writeFile('./db/channels.json', JSON.stringify(channels, null, 4));

        return { status: 200, message: 'Channel added successfully', channel: body };
    } catch (error) {
        console.error('Error adding channel:', error);
        return { status: 500, message: 'Error adding channel' };
    }
});