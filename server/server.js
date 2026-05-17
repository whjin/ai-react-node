const http = require('http');
const { aiMessage } = require('./mock/ai-message');

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const lastEventId = req.headers['last-event-id'];

    let messageIndex = lastEventId ? parseInt(lastEventId, 10) : 0;

    let flag = isNaN(messageIndex) || messageIndex < 0 || messageIndex >= aiMessage.length;
    if (flag) {
      messageIndex = 0;
    }

    res.write(`: This is comment\n`);
    res.write(`retry: 3000\n`);

    const sendMessage = () => {
      if (messageIndex < aiMessage.length) {
        res.write(`id: ${messageIndex + 1}\n`);
        res.write(`event: message\n`);
        res.write(
          `data: ${JSON.stringify({
            content: aiMessage[messageIndex],
          })}\n\n`
        );

        messageIndex++;

        const delay = Math.floor(Math.random() * 501) + 500;
        setTimeout(sendMessage, delay);
      } else {
        res.write(`id: final\n`);
        res.write(`event: complete\n`);
        res.write(`data: "stream completed"\n\n`);
        res.end();
      }
    };

    sendMessage();

    req.on('close', () => {
      console.log('客户端断开连接');
    });
  }
});

server.listen(PORT, () => {
  console.log(`服务器正在运行，端口: ${PORT}`);
});
