import fs from 'fs/promises';
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { User } from '~/models/userModel'

export default defineEventHandler(async (event) => {
    try {
        const serverId = getRouterParam(event, 'serverId');
        if (!serverId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Server ID is required',
            });
        }

        const serverUsersPath = `./db/serverUsers/users_${serverId}.json`;
        const allUsersPath = './db/users.json';

        let serverUserIds: string[];
        let allUsers: User[];

        try {
            const serverData = await fs.readFile(serverUsersPath, 'utf8');
            const allUsersData = await fs.readFile(allUsersPath, 'utf8');

            serverUserIds = JSON.parse(serverData);
            allUsers = JSON.parse(allUsersData);
        } catch (error) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Server not found',
            });
        }

        const serverUsers = serverUserIds
            .map(id => allUsers.find(user => user.id === id))
            .filter((user): user is User => user !== undefined)
            .map(({ id, username }) => ({ id, username }));

        return {
            status: 'success',
            message: 'Server users retrieved',
            users: serverUsers
        };
    } catch (error : any) {
        if (error.statusCode === 404) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to get server users: ${error}`,
        });
    }
});