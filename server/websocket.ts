import { WebSocketServer, WebSocket } from 'ws';
import { Message } from '~/models/messageModel';

const wss = new WebSocketServer({ port: 3001 });

const clientsByChannel = new Map<string, Set<WebSocket>>();
const connectedClients = new Set<WebSocket>();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const channelId = url.searchParams.get('channelId');

    if (channelId) {
        handleChannelConnection(ws, userId!, channelId);
    } else {
        handleNotificationConnection(ws, userId);
    }
});

function handleChannelConnection(ws: WebSocket, userId: string, channelId: string) {
    if (!clientsByChannel.has(channelId)) {
        clientsByChannel.set(channelId, new Set());
    }

    const channelClients = clientsByChannel.get(channelId)!;
    channelClients.add(ws);
    console.log(`User: ${userId} connected to channel: ${channelId} clients: ${channelClients.size}`);

    ws.on('close', () => {
        channelClients.delete(ws);
        console.log(`User: ${userId} disconnected from channel: ${channelId} clients: ${channelClients.size}`);
        if (channelClients.size === 0) {
            clientsByChannel.delete(channelId);
            console.log(`Closed channel: ${channelId}`);
        }
    });
}

function handleNotificationConnection(ws: WebSocket, userId: string | null) {
    connectedClients.add(ws)
    console.log(`User: ${userId} connected to notifications clients: ${connectedClients.size}`);

    ws.on('close', () => {
        connectedClients.delete(ws);
        console.log(`User: ${userId} disconnected from notifications clients: ${connectedClients.size}`);
    });
}

const sendToChannel = (message: Message) => {
    const clients = clientsByChannel.get(message.channelId);
    clients!.forEach((client: WebSocket) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });

};

const sendNotifications = (message: Message, serverName: string, channelName: string) => {
    connectedClients.forEach((clientData, client: WebSocket) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({ message, serverName, channelName }));
        }
    });
};

export { sendToChannel, sendNotifications };
