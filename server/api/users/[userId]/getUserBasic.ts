import fs from 'fs/promises';
import { defineEventHandler, getRouterParam, createError } from 'h3';
import {User, UserBasics} from '../../../../models/userModel';
export default defineEventHandler(async (event) => {
    try{
        const query = getQuery(event);
        const userId = getRouterParam(event, 'userId');

        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required',
            });
        }
        const serverData = await fs.readFile('./db/users.json', 'utf8');
        const users: User[] = JSON.parse(serverData);
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }
        const userBasic: UserBasics = { id: user.id, username: user.username, avatar: user.avatar };
        return {
            status: 'success',
            userBasic: userBasic,
        };
    }
    catch (error: any) {
        console.error('Handler error:', error);
        return createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error',
        });
    }
});
