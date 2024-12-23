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
            servers = [];
        }

        if (!servers.includes(serverId)) {
            servers.push(serverId);
            await fs.writeFile(filePath, JSON.stringify(servers, null, 2), 'utf8');
        }

        return {
            status: 'success',
            message: 'Server assigned to user',
            servers
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Server assignment error: ${error}`,
        });
    }
});