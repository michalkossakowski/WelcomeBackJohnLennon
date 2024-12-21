import fs from 'fs/promises';

export default defineEventHandler(async (event) => {
    try {
        const serverId = event.context.params?.id;

        const data = await fs.readFile('./db/servers.json', 'utf8');
        const servers = JSON.parse(data);

        const server = servers.find((s: { id: string }) => s.id === serverId);

        if (!server) {
            return { status: 404, message: 'Server not found' };
        }

        return server; // Return the server data
    } catch (error) {
        console.error('Error fetching server data:', error);
        return { status: 500, message: 'Error fetching server data' };
    }
});
