import fs from 'fs/promises';
import { Message } from '~/models/messageModel';

export default defineEventHandler(async (event) => {
  try {

    const { channelId } = event.context.params || {}; 

    if (!channelId) {
      throw new Error('channelId is required');
    }

    const data = await fs.readFile('./db/messages.json', 'utf8');
    const messages = JSON.parse(data);

    const filteredMessages = messages.filter((msg : Message) => msg.channelId === channelId);

    return filteredMessages;

  } 
  catch (error) {
    console.error('Error getting messages:', error);
    return { status: 500, message: 'Error getting messages: ' + error };
  }
});
