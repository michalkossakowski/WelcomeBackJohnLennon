import fs from 'fs/promises';
import { defineEventHandler, getRouterParam, createError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const userId = getRouterParam(event, 'userId');
        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required',
            });
        }

        const userServersFilePath = `./db/userServers/servers_${userId}.json`;
        const serversFilePath = './db/servers.json';

        let userServerIds: string[];
        try {
            const userData = await fs.readFile(userServersFilePath, 'utf8');
            userServerIds = JSON.parse(userData);
        } catch (error) {
            userServerIds = [];
        }

        let allServers: { id: string, title: string, creatorId: string, createdAt: string }[];
        try {
            const serverData = await fs.readFile(serversFilePath, 'utf8');
            allServers = JSON.parse(serverData);
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to retrieve server data',
            });
        }

        const userServers = allServers.filter(server => userServerIds.includes(server.id));

        return {
            status: 'success',
            message: 'User servers retrieved',
            servers: userServers,
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to get user servers`,
        });
    }
});
