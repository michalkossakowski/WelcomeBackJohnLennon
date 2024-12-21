import fs from 'fs/promises';
import path from 'path';
import { User } from '~/models/userModel';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const { userId, friendCode } = body;

        const usersData = await fs.readFile('./db/users.json', 'utf8')
        const users:User[] = JSON.parse(usersData)

        const friendUser = users.find(user => user.id === friendCode)

        if(!friendUser ) {
            throw createError({
                statusCode: 404,
                statusMessage: `Message:Friend code: [${friendCode}] not found`})
        }
        if(friendUser.id === userId){
            throw createError({
                statusCode: 404,
                statusMessage: `Message:This is your friend code`})
        }
        
        const folderPath = './db/friends';
        const userFilePath = path.join(folderPath, `friends_${userId}.json`);
        const friendFilePath = path.join(folderPath, `friends_${friendCode}.json`);

        try {
            await fs.access(folderPath);
        } catch {
            await fs.mkdir(folderPath, { recursive: true });
        }

        let userFriends: string[] = [];
        let friendFriends: string[] = [];


        try {
            const userData = await fs.readFile(userFilePath, 'utf8');
            userFriends = JSON.parse(userData);
        } catch {
            userFriends = [];
        }

        try {
            const friendData = await fs.readFile(friendFilePath, 'utf8');
            friendFriends = JSON.parse(friendData);
        } catch {
            friendFriends = [];
        }

        if (userFriends.includes(friendCode) || friendFriends.includes(userId)) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Message:You are already friends with this user',
            });
        }

        userFriends.push(friendCode);
        await fs.writeFile(userFilePath, JSON.stringify(userFriends, null, 2), 'utf8');

        friendFriends.push(userId);
        await fs.writeFile(friendFilePath, JSON.stringify(friendFriends, null, 2), 'utf8');

        return {
            status: 'success',
            message: 'Message:Friend added successfully',
            friend: {
                id: friendUser.id,
                username: friendUser.username,
            },
        };
    } catch (error) {
        throw error;
    }
});
