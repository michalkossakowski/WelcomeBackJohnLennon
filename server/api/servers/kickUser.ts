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
            throw createError({
                statusCode: 404,
                statusMessage: 'Server has no users assigned',
            });
        }

        const userIndex = users.indexOf(userId);
        if (userIndex === -1) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found in server\'s list',
            });
        }

        users.splice(userIndex, 1);
        await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');

        return {
            status: 'success',
            message: 'User removed from server\'s list',
            users
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `User removal error: ${error}`,
        });
    }
});