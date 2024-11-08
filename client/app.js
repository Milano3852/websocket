let socket;
let selectedUrl = null;

function searchUrls() {
  const keyword = document.getElementById('keyword').value;
  if (!keyword) {
    alert('Please enter a keyword');
    return;
  }

  fetch(`/api/urls?keyword=${keyword}`)
    .then(response => response.json())
    .then(data => {
      if (data.urls) {
        displayUrls(data.urls);
      } else {
        alert('No URLs found for the keyword');
      }
    })
    .catch(error => console.error('Error fetching URLs:', error));
}

function displayUrls(urls) {
  const urlList = document.getElementById('urls');
  urlList.innerHTML = '';
  urls.forEach(url => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.innerText = url;
    button.onclick = () => startDownload(url);
    li.appendChild(button);
    urlList.appendChild(li);
  });
  document.getElementById('url-list').style.display = 'block';
}

function startDownload(url) {
  selectedUrl = url;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = new WebSocket(`ws://${window.location.hostname}:3000`);
    socket.onmessage = updateProgress;
  }

  socket.onopen = () => {
    socket.send(JSON.stringify({ url }));
    document.getElementById('download-status').style.display = 'block';
  };
}

function updateProgress(event) {
  const data = JSON.parse(event.data);
  
  if (data.error) {
    alert(`Error: ${data.error}`);
  } else if (data.progress) {
    document.getElementById('progress-bar').value = data.progress;
    document.getElementById('progress-text').innerText = `${data.progress}%`;
    
    if (data.progress >= 100) {
      saveContent(data.url, 'Sample content from URL'); // Эмуляция сохранения
    }
  }
}

function saveContent(url, content) {
  const storedContents = JSON.parse(localStorage.getItem('downloadedContents') || '[]');
  storedContents.push({ url, content });
  localStorage.setItem('downloadedContents', JSON.stringify(storedContents));
  displayDownloadedContents();
}

function displayDownloadedContents() {
  const contents = JSON.parse(localStorage.getItem('downloadedContents') || '[]');
  const contentList = document.getElementById('downloaded-contents');
  contentList.innerHTML = '';
  contents.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerText = `Content ${index + 1}: ${item.content} (from ${item.url})`;
    contentList.appendChild(li);
  });
  document.getElementById('content-list').style.display = 'block';
}
