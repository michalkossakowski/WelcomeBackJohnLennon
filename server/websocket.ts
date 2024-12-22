import { WebSocketServer, WebSocket } from 'ws';
import { Message } from '~/models/messageModel';

const wss = new WebSocketServer({ port: 3001 });

const clientsByChannel = new Map<string, Set<WebSocket>>();
const connectedClients = new Set<{ userId: string, ws: WebSocket }>();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const channelId = url.searchParams.get('channelId');

    if (channelId) {
        handleChannelConnection(ws, userId!, channelId);
    } else {
        handleNotificationConnection(ws, userId!);
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

function handleNotificationConnection(ws: WebSocket, userId: string ) {
    connectedClients.add({ userId, ws });
    console.log(`User: ${userId} connected to notifications clients: ${connectedClients.size}`);

    ws.on('close', () => {
        connectedClients.delete({ userId, ws });
        console.log(`User: ${userId} disconnected from notifications clients: ${connectedClients.size}`);
    });
}

const sendMessageToChannel = (message: Message) => {
    const clients = clientsByChannel.get(message.channelId);
    clients!.forEach((client: WebSocket) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });

};

const sendServerNotifications = (message: Message, serverName: string, channelName: string, serverUsers: string[]) => {
    connectedClients.forEach(({ userId, ws }: { userId: string, ws: WebSocket }) => {
        if (ws.readyState === 1 && serverUsers.includes(userId)) {
            ws.send(JSON.stringify({ message, serverName, channelName}));
        }
    });
};

const sendChatNotifications = (message: Message, receiverId: string, channelName: string) => {

    const receiverClient = Array.from(connectedClients).find(({ userId, ws }: { userId: string, ws: WebSocket }) => 
        ws.readyState === WebSocket.OPEN && userId === receiverId
    );
    if (receiverClient) {
        const { ws } = receiverClient;
        try {
            ws.send(JSON.stringify({ message, serverName: "Private", channelName }));
        } catch (error) {
            console.error(`Error sending message to ${receiverId}:`, error);
        }
    } else {
        console.log(`No client with id: ${receiverId} is offline`);
    }
};

export { sendMessageToChannel, sendServerNotifications, sendChatNotifications };
