// server/api/servers/[serverId]/users.get.ts
import fs from 'fs/promises';
import { defineEventHandler, getRouterParam, createError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const serverId = getRouterParam(event, 'serverId');
        if (!serverId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Server ID is required',
            });
        }

        const filePath = `./db/serverUsers/users_${serverId}.json`;

        let users: string[];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            users = [];
        }

        return {
            status: 'success',
            message: `Server users retrieved`,
            users
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to get server users: ${error}`,
        });
    }
});