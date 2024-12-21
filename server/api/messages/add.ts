import fs from 'fs/promises';
import path from 'path';
import { Message } from '~/models/messageModel';
import { sendToChannel, sendNotifications } from '../../websocket';

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
            sendNotifications(body, "Private", body.author);
        }
        else{
            const channelData = await fs.readFile("./db/channels.json", 'utf8');
            const channels = JSON.parse(channelData);
            const channel = channels.find((ch: { id: string }) => ch.id === body.channelId);
    
            const serverData = await fs.readFile("./db/servers.json", 'utf8');
            const servers = JSON.parse(serverData);
            const server = servers.find((s: { id: string }) => s.id === channel.serverId);
            sendNotifications(body, server.title, channel.title);
        }

        sendToChannel(body);
        
        return {
            status: 'success',
            message: 'Message added',
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Message add error: ${error}`,
        });
    }
});
