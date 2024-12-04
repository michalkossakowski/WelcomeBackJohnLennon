import { WebSocketServer } from 'ws';
import { Message } from '~/models/messageModel'; 

const wss = new WebSocketServer({ port: 3001 }); 

wss.on('connection', (ws) => {
  console.log('New Client Connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.send('Welcome on WebSocket!');
});

// do wszysktich połączonych
const broadcast = (message: Message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { 
      client.send(JSON.stringify(message));
    }
  });
};

export { broadcast };