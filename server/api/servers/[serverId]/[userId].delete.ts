import fs from 'fs/promises';
import { defineEventHandler, getRouterParam, createError } from 'h3';

type UserId = string;
type ServerId = string;
type UserList = UserId[];
type ServerList = ServerId[];

export default defineEventHandler(async (event) => {
    try {
        const serverId = getRouterParam(event, 'serverId');
        const userId = getRouterParam(event, 'userId');

        if (!serverId || !userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Server ID and User ID are required',
            });
        }

        const serverUsersPath = `./db/serverUsers/users_${serverId}.json`;
        const userServersPath = `./db/userServers/servers_${userId}.json`;

        try {
            let serverUsers: UserList = [];
            try {
                const serverData = await fs.readFile(serverUsersPath, 'utf8');
                serverUsers = JSON.parse(serverData);
            } catch (error: any) {

            }
            serverUsers = serverUsers.filter((id: UserId) => id !== userId);

            let userServers: ServerList = [];
            try {
                const userData = await fs.readFile(userServersPath, 'utf8');
                userServers = JSON.parse(userData);
            } catch (error: any) {

            }
            userServers = userServers.filter((id: ServerId) => id !== serverId);

            await Promise.all([
                fs.writeFile(serverUsersPath, JSON.stringify(serverUsers, null, 2)),
                fs.writeFile(userServersPath, JSON.stringify(userServers, null, 2))
            ]);
        } catch (error: any) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to update user-server relationship',
                data: error
            });
        }

        return {
            status: 'success',
            message: 'User-server relationship removed'
        };
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to remove user-server relationship: ${error}`,
        });
    }
});