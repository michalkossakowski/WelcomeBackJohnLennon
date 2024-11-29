import fs from 'fs/promises';

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    const messagesFilePath = './db/messages.json';

    const messages = await fs.readFile(messagesFilePath, 'utf8');
    return JSON.parse(messages);
});
