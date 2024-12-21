import fs from 'fs/promises'
import path from 'path';

export default defineEventHandler(async (event) => {
    try {
        const userId = event.context.params?.id;
        const friendId = event.context.params?.friendId;

        const chatsFilePath = path.join('./db/chats', `chats_${userId}.json`);
        const chatsData = await fs.readFile(chatsFilePath, 'utf8');


        const friends: UserBasics[] = users.filter((user) => friendIds.includes(user.id)).map((user) => ({
            id: user.id,
            username: user.username,
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
