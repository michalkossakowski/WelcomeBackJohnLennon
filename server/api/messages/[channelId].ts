import fs from 'fs/promises';
import path from 'path';
import { Message } from '~/models/messageModel';

export default defineEventHandler(async (event) => {
    try {
        const { channelId } = event.context.params || {};
        const filePath = path.join('./db/messagesByChannel', `messages_${channelId}.json`);

        try {
            const data = await fs.readFile(filePath, 'utf8');
            const messages: Message[] = JSON.parse(data);

            return messages;
        }
        catch (error) {
            return [];
        }
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Messages get by channel error: ${error}`,
        });
    }
});
