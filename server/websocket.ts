import { WebSocketServer } from 'ws';
import { Message } from '~/models/messageModel'; 

const wss = new WebSocketServer({ port: 3001 }); 

const clientsByChannel = new Map();

wss.on('connection', (ws, req) => {

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  const userId =  url.searchParams.get('userId');
  const channelId = url.searchParams.get('channelId');

  if (!clientsByChannel.has(channelId)) {
    clientsByChannel.set(channelId, new Set());
  }
  clientsByChannel.get(channelId).add(ws);
  
  console.log('New Client Connected user:'+userId + " channel:"+ channelId);
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

});

const sendToChannel = (channelId : string, message: Message) => {
  const clients = clientsByChannel.get(channelId);
  if (clients) {
    clients.forEach((client : WebSocket) => {
      if (client.readyState === 1) { 
        client.send(JSON.stringify(message));
      }
    });
  } else {
    console.log(`No clients found in channel: ${channelId}`);
  }
};

export { sendToChannel };