import fs from 'fs/promises';
import { defineEventHandler, createError } from 'h3';

interface Channel {
    id: string;
    serverId: string;
    title: string;
    creatorId: string;
}

export default defineEventHandler(async (event) => {
    const channelId: string | undefined = event.context.params?.channelId;
    if (!channelId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Channel ID is required'
        });
    }

    try {
        // 1. Delete channels messages
        try {
            await fs.unlink(`./db/messages/channel_${channelId}.json`);
        } catch (error) {
            console.log(`No messages found for channel ${channelId}`);
        }

        // 2. Remove channel from channels
        const channelsPath = './db/channels.json';
        const channelsData = await fs.readFile(channelsPath, 'utf8');
        const channels: Channel[] = JSON.parse(channelsData);
        const updatedChannels = channels.filter((channel: Channel) => channel.id !== channelId);
        await fs.writeFile(channelsPath, JSON.stringify(updatedChannels, null, 2));

        return {
            status: 'success',
            message: 'Channel and all associated messages deleted successfully'
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to delete channel: ${error}`
        });
    }
});
