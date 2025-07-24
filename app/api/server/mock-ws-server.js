const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 });
console.log('server running on 4000');

function createDataPoint() {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        temperature: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        humidity: parseFloat((Math.random() * 50 + 30).toFixed(2))
    });
}

wss.on('connection', (ws) => {
    console.log('connected');
    const now = Date.now();
    const totalSec = 72 * 60 * 60;
    for (let i = 0; i < totalSec; i++) {
        const timestamp = new Date(now + i * 1000).toString();
        const temperature = parseFloat((Math.random() * 10 - 5).toFixed(2));
        const humidity = parseFloat((Math.random() * 50 + 30).toFixed(2));
        ws.send(JSON.stringify({ timestamp, temperature, humidity }));
    }

    //send data every second
    const interval = setInterval(() => {
        ws.send(createDataPoint());
    }, 1000);

    ws.on('close', () => {
        console.log('client disconnected');
        clearInterval(interval);
    })
})