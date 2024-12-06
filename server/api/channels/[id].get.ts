import fs from 'fs/promises';

export default defineEventHandler(async (event) => {
    try {
        const data = await fs.readFile('./db/channels.json', 'utf8');
        const channels = JSON.parse(data);

        const serverId = event.context.params?.id;

        const filteredChannels = channels.filter(
            (channel: { serverId: string }) => channel.serverId === serverId
        );

        if (filteredChannels.length === 0) {
            return { message: 'No channels found for this server', channels: [] };
        }

        return { channels: filteredChannels };
    } catch (error) {
        console.error('Error getting channels:', error);
        return { status: 500, message: 'Error getting channels' };
    }
});
