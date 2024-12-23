import fs from 'fs/promises';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const { userId, serverId } = await readBody(event);
        const filePath = `./db/userServers/servers_${userId}.json`;

        let servers: string[];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            servers = JSON.parse(data);
        } catch (error) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User has no servers assigned',
            });
        }

        const serverIndex = servers.indexOf(serverId);
        if (serverIndex === -1) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Server not found in user\'s list',
            });
        }

        servers.splice(serverIndex, 1);
        await fs.writeFile(filePath, JSON.stringify(servers, null, 2), 'utf8');

        return {
            status: 'success',
            message: 'Server removed from user\'s list',
            servers
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Server removal error: ${error}`,
        });
    }
});