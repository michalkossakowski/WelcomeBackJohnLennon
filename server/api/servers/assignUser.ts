import fs from 'fs/promises';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    try {
        const { userId, serverId } = await readBody(event);
        const filePath = `./db/serverUsers/users_${serverId}.json`;

        let users: string[];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            users = [];
        }

        if (!users.includes(userId)) {
            users.push(userId);
            await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
        }

        return {
            status: 'success',
            message: 'User assigned to server',
            users
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `User assignment error: ${error}`,
        });
    }
});