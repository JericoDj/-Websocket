import { WebSocketServer, WebSocket } from 'ws';

function sendJson(socket, payload) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    }
}

function broadcast(wss, payload) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            sendJson(client, payload);
        }
    });
}

function heartbeat() {
    this.isAlive = true;
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    }); // Add 'verifyClient' or other options if needed, but not requested.

    wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.isAlive = true;
        ws.on('pong', heartbeat);

        sendJson(ws, { type: 'connection', data: 'Connected' });

        ws.on("error", console.error);
        ws.on("close", () => {
            console.log("Client disconnected");
        });

        ws.on('message', (message) => {
            console.log('Received message:', message);
            // broadcast(wss, { type: 'message', data: message.toString() });
        });
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', function close() {
        clearInterval(interval);
    });

    function broadcastMatchStatus(matchId, status) {
        broadcast(wss, { type: 'matchStatus', data: { matchId, status } });
    }

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'matchCreated', data: match });
    }

    return { broadcastMatchStatus, broadcastMatchCreated };
}