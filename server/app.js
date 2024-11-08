const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const { Worker } = require('worker_threads');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const keywords = JSON.parse(fs.readFileSync('./server/keywords.json', 'utf8'));

app.get('/api/urls', (req, res) => {
  const keyword = req.query.keyword;
  if (keywords[keyword]) {
    res.json({ urls: keywords[keyword] });
  } else {
    res.status(404).json({ message: 'Keyword not found' });
  }
});

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  
  ws.on('message', (message) => {
    const { url } = JSON.parse(message);
    if (!url) return;

    const worker = new Worker('./server/downloadWorker.js', {
      workerData: { url }
    });

    worker.on('message', (data) => {
      if (data.error) {
        ws.send(JSON.stringify({ error: data.error }));
        worker.terminate();
      } else {
        ws.send(JSON.stringify(data));
        if (data.complete) {
          worker.terminate();
        }
      }
    });

    worker.on('error', (error) => {
      ws.send(JSON.stringify({ error: error.message }));
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
