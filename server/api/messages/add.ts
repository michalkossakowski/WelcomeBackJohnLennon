import fs from 'fs/promises';
import path from 'path';
import { Message } from '~/models/messageModel';
import { sendMessageToChannel, sendChatNotifications, sendServerNotifications } from '../../websocket';

export default defineEventHandler(async (event) => {
    try {
        const body: Message = await readBody(event);
        const folderPath = './db/messagesByChannel';
        const filePath = path.join(folderPath, `messages_${body.channelId}.json`);

        try {
            await fs.access(folderPath);
        } catch (error) {
            await fs.mkdir(folderPath, { recursive: true });
        }

        let messages: Message[];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            messages = JSON.parse(data);
        } catch (error) {
            messages = [];
        }

        messages.push(body);
        await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf8');

        if(body.channelId.startsWith("chat")) {
            let receiverId = body.channelId;
            receiverId = receiverId.replace("chat", "");
            receiverId = receiverId.replace(body.authorId, "");
            sendChatNotifications(body, receiverId, body.author);
        }
        else {

            const channelData = await fs.readFile("./db/channels.json", 'utf8');
            const channels = JSON.parse(channelData);
            const channel = channels.find((ch: { id: string }) => ch.id === body.channelId);
    
            const serverData = await fs.readFile("./db/servers.json", 'utf8');
            const servers = JSON.parse(serverData);
            const server = servers.find((s: { id: string }) => s.id === channel.serverId);

            const serverUsersData = await fs.readFile(`./db/serverUsers/users_${server.id}.json`, 'utf8');
            const serverUsers = JSON.parse(serverUsersData);

            if (!serverUsers.includes(body.authorId)) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'You are not a member of this server.',
                });
            }

            sendServerNotifications(body, server.title, channel.title, serverUsers);
        }

        sendMessageToChannel(body);
        
        return {
            status: 'success',
            message: 'Message added',
        };
    }
    catch (error: unknown) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }
        else {
            throw createError({
                statusCode: 500,
                statusMessage: `Message add error: ${error}`,
            });
        }
    }
});
