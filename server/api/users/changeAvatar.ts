import fs from 'fs/promises';
import { defineEventHandler, getRouterParam, createError } from 'h3';
import {User} from '../../../models/userModel';
export default defineEventHandler(async (event) => {
    try{
        const body = await readBody(event);
        const filePath = body.filePath;
        const userId = body.userId;

        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required',
            });
        }
        const serverData = await fs.readFile('./db/users.json', 'utf8');
        const users: User[] = JSON.parse(serverData)
        const user = users.find(u => u.id === userId);
        console.log('User:', user);
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }

        const oldAvatarPath = user.avatar;

        const updatedUsers = users.map((user: User) => 
            user.id === userId ? { ...user, avatar: filePath } : user
        );
        await fs.writeFile('./db/users.json', JSON.stringify(updatedUsers, null, 2), 'utf8');

        if (oldAvatarPath) {
            try {
                if(oldAvatarPath !== "/assets/defaultUserIcon.jpg"){
                    await fs.unlink(`./public/${oldAvatarPath}`);
                    console.log('Old avatar removed:', oldAvatarPath);
                } 
            } catch (err) {
                console.error('Error removing old avatar:', err);
            }
        }
        return {
            status: 'success',
            message: 'Avatar updated',
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