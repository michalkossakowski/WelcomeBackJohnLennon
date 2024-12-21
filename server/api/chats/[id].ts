import fs from 'fs/promises'
import path from 'path';
import { Chat } from '~/models/chatModel';

export default defineEventHandler(async (event) => {
    try {
        const userId = event.context.params?.id;

        const userFilePath = path.join('./db/chats', `chats_${userId}.json`);;

        let userChats: Chat[] = [];

        try {
            const userData = await fs.readFile(userFilePath, 'utf8');
            userChats = JSON.parse(userData);
        } catch {
            userChats = [];
        }

        const friendIds = userChats.map(chat => chat.friendId);
        return  friendIds;
    }
    catch (error) {
        throw error;
    }
})
