import { createWebSocketHandler } from 'h3';

const wsHandler = createWebSocketHandler((socket) => {
  console.log('WebSocket connected');

  socket.on('message', (message) => {
    console.log('Received message:', message);
  });

  socket.on('close', () => {
    console.log('WebSocket closed');
  });
});

export default wsHandler;