import { WebSocketServer, WebSocket } from 'ws';
import { string } from 'yup';
import { Message } from '~/models/messageModel';

const wss = new WebSocketServer({ port: 3001 });

const clientsByChannel = new Map<string, Set<WebSocket>>();
const connectedClients = new Set<{ userId: string, ws: WebSocket }>();

const usersInCall = new Set<string>();
const videoCalls= new Map<string,Set<WebSocket> >();


wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const channelId = url.searchParams.get('channelId');
    const CallerId = url.searchParams.get('CallerId');
    const CalleeID = url.searchParams.get('CalleeID');

    
    if (channelId) {
        handleChannelConnection(ws, userId!, channelId);
    }else if(CallerId && CalleeID){
        handleCallConnection(ws, CallerId!, CalleeID!);
    }else{
        handleNotificationConnection(ws, userId!);
    }
});

function handleCallConnection(ws: WebSocket, CallerId: string, CalleeID: string){
    if (!videoCalls.has(CallerId+':'+CalleeID)) {
        videoCalls.set(CallerId+':'+CalleeID, new Set());
    }
    const callClients = videoCalls.get(CallerId+':'+CalleeID)!;
    callClients.add(ws);
    console.log(`User: ${CallerId} and ${CalleeID} connected to call clients`);
    usersInCall.add(CallerId);
    usersInCall.add(CalleeID);
    ws.on('message', (message: string) => {
        const parsedMessage = JSON.parse(message);
        // Broadcast the message to all other clients
        callClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage));
            }
        });
    });
    ws.on('close', () => {
        usersInCall.delete(CallerId);
        usersInCall.delete(CalleeID);
        videoCalls.delete(CallerId+':'+CalleeID);
    });
}

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
        if (ws.readyState === 1 && serverUsers.includes(userId) && userId !== message.authorId) {
            ws.send(JSON.stringify({ title: `Channel: /${serverName}/${channelName}`, message: `Message: ${message.content}`}));
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
            ws.send(JSON.stringify({ title: `Private chat with: ${message.author}`, message: `Message: ${message.content}` }));
        } catch (error) {
            console.error(`Error sending message to ${receiverId}:`, error);
        }
    } else {
        console.log(`No client with id: ${receiverId} is offline`);
    }
};
function sendCallNotification(from: string, to: string ) {
    const receiverClient = Array.from(connectedClients).find(({ userId, ws }: { userId: string, ws: WebSocket }) => 
        ws.readyState === WebSocket.OPEN && userId === to
    );
    if(usersInCall.has(to)){
        return { status: 'error', message: 'User is in call' };
    }
    if (receiverClient) {
        const { ws } = receiverClient;
        try {
            ws.send(JSON.stringify({ title: 'Incoming call', message: from }));
        } catch (error) {
            console.error(`Error sending call request to ${to}:`, error);
        }finally{
            return { status: 'success', message: 'Call request sent' };
        }
    } else {
        console.log(`No client with id: ${to} is offline`);
        return { status: 'error', message: 'User is offline' };
    }
}

function sendCallResponse(from: string, to: string, response: string) {
    const receiverClient = Array.from(connectedClients).find(({ userId, ws }: { userId: string, ws: WebSocket }) => 
        ws.readyState === WebSocket.OPEN && userId === to
    );
    if (receiverClient) {
        const { ws } = receiverClient;
        try {
            ws.send(JSON.stringify({ title: 'Call response', message: response, from: from}));
        } catch (error) {
            console.error(`Error sending call response to ${to}:`, error);
        }finally{
            return { status: 'success', message: 'Call request answered' };
        }
    } else {
        console.log(`No client with id: ${to} is offline`);
        return { status: 'error', message: 'User is offline' };
    }
}
function sendCallCancelation(from: string, to: string) {
    const receiverClient = Array.from(connectedClients).find(({ userId, ws }: { userId: string, ws: WebSocket }) => 
        ws.readyState === WebSocket.OPEN && userId === to
    );
    if (receiverClient) {
        const { ws } = receiverClient;
        try {
            ws.send(JSON.stringify({ title: 'Cancel call' }));
        } catch (error) {
            console.error(`Error sending call response to ${to}:`, error);
        }finally{
            return { status: 'success', message: 'Call request answered' };
        }
    } else {
        console.log(`No client with id: ${to} is offline`);
        return { status: 'error', message: 'User is offline' };
    }
}


export { sendMessageToChannel, sendServerNotifications, sendChatNotifications, sendCallNotification, sendCallResponse, sendCallCancelation};
