import fs from 'fs/promises';
import path from 'path';
import { Chat } from '~/models/chatModel';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const { userId, friendId} = body;

        const folderPath = './db/chats';
        const userFilePath = path.join(folderPath, `chats_${userId}.json`);
        const friendFilePath = path.join(folderPath, `chats_${friendId}.json`);

        try {
            await fs.access(folderPath);
        } catch {
            await fs.mkdir(folderPath, { recursive: true });
        }

        let userChats: Chat[] = [];
        let friendChats: Chat[] = [];

        try {
            const userData = await fs.readFile(userFilePath, 'utf8');
            userChats = JSON.parse(userData);
        } catch {
            userChats = [];
        }

        try {
            const friendData = await fs.readFile(friendFilePath, 'utf8');
            friendChats = JSON.parse(friendData);
        } catch {
            friendChats = [];
        }

        let chatId: string;
        const existingChat = userChats.find(chat => chat.friendId === friendId);

        if (!existingChat) {
            chatId = "chat"+userId+friendId;

            userChats.push({ chatId: chatId, friendId: friendId });
            await fs.writeFile(userFilePath, JSON.stringify(userChats, null, 2), 'utf8');

            friendChats.push({ chatId: chatId, friendId: userId });
            await fs.writeFile(friendFilePath, JSON.stringify(friendChats, null, 2), 'utf8');
        } else {
            chatId = existingChat.chatId;
        }
        
        return  chatId
    } catch (error) {
        throw error;
    }
});
