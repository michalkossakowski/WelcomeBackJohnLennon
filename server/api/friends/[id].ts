import fs from 'fs/promises'
import path from 'path';
import { UserBasics, User } from '~/models/userModel'

export default defineEventHandler(async (event) => {
    try {
        const userId = event.context.params?.id;

        const friendsFilePath = path.join('./db/friends', `friends_${userId}.json`);
        const friendsData = await fs.readFile(friendsFilePath, 'utf8');
        const friendIds: string[] = JSON.parse(friendsData);

        const usersFilePath = './db/users.json'
        const data = await fs.readFile(usersFilePath, 'utf8')
        const users: User[] = JSON.parse(data)

        const friends: UserBasics[] = users.filter((user) => friendIds.includes(user.id)).map((user) => ({
            id: user.id,
            username: user.username,
            avatar: user.avatar,
        }));

        return { statusCode: 200,  statusMessage: 'Get friends error',friends }
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Get friends error: ' + error,
        })
    }
})
