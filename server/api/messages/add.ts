import fs from 'fs/promises';
import { Message } from '~/models/messageModel'; 
import { broadcast } from '../../websocket';

export default defineEventHandler(async (event) => {
  try {
    const body: Message = await readBody(event);  

    const filePath = './db/messages.json';
    const data = await fs.readFile(filePath, 'utf8');
    let messages: Message[] = JSON.parse(data);

    messages.push(body);
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf8');

    // do wszystkich
    broadcast(body);

    return {
      status: 'success',
      message: 'Message added',
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Message error: ${error}`,
    });
  }
});
