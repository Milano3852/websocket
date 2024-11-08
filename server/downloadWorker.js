const { parentPort, workerData } = require('worker_threads');
const axios = require('axios');

async function downloadContent(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'stream'
    });

    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const progress = Math.floor((downloadedSize / totalSize) * 100);
      
      // Отправляем прогресс в основной поток
      parentPort.postMessage({ progress });
    });

    response.data.on('end', () => {
      parentPort.postMessage({ progress: 100, complete: true });
    });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
}

// Запускаем загрузку контента с указанного URL
downloadContent(workerData.url);
