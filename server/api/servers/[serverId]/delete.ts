import fs from 'fs/promises';
import { defineEventHandler, createError } from 'h3';

interface Channel {
    id: string;
    serverId: string;
    title: string;
    creatorId: string;
}

interface Server {
    id: string;
    title: string;
    creatorId: string;
    createdAt: string;
}

export default defineEventHandler(async (event) => {
    const serverId: string | undefined = event.context.params?.serverId;
    if (!serverId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Server ID is required'
        });
    }

    try {
        // 1. Load channels in
        const channelsPath = './db/channels.json';
        const channelsData = await fs.readFile(channelsPath, 'utf8');
        const channels: Channel[] = JSON.parse(channelsData);

        // Find all channels that belong to the server and leave the rest
        const serverChannels = channels.filter((channel: Channel) => channel.serverId === serverId);
        const remainingChannels = channels.filter((channel: Channel) => channel.serverId !== serverId);

        // 2. Delete all messages from servers channels
        for (const channel of serverChannels) {
            try {
                await fs.unlink(`./db/messages/channel_${channel.id}.json`);
            } catch (error) {
                console.log(`No messages found for channel ${channel.id}`);
            }
        }

        // 3. Update channels.json with remaining channels
        await fs.writeFile(channelsPath, JSON.stringify(remainingChannels, null, 2));

        // 4. Delete server from servers
        const serversPath = './db/servers.json';
        const serversData = await fs.readFile(serversPath, 'utf8');
        const servers: Server[] = JSON.parse(serversData);
        const updatedServers = servers.filter((server: Server) => server.id !== serverId);
        await fs.writeFile(serversPath, JSON.stringify(updatedServers, null, 2));

        // 5. Delete the servers users file
        try {
            await fs.unlink(`./db/serverUsers/users_${serverId}.json`);
        } catch (error) {
            console.log(`No users file found for server ${serverId}`);
        }

        // 6. Remove server from all users server lists
        const files = await fs.readdir('./db/userServers');

        for (const file of files) {
            if (file.startsWith('servers_')) {
                const filePath = `./db/userServers/${file}`;
                const userData = await fs.readFile(filePath, 'utf8');
                const userServers: string[] = JSON.parse(userData);

                if (userServers.includes(serverId)) {
                    const updatedUserServers = userServers.filter((id: string) => id !== serverId);
                    await fs.writeFile(filePath, JSON.stringify(updatedUserServers, null, 2));
                }
            }
        }

        return {
            status: 'success',
            message: 'Server and all associated data deleted successfully'
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to delete server: ${error}`
        });
    }
});