export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const domain = env.DOMAIN;
    const DATABASE = env.DATABASE;
    const USERNAME = env.USERNAME;
    const PASSWORD = env.PASSWORD;
    const adminPath = env.ADMIN_PATH;
    const enableAuth = env.ENABLE_AUTH === 'true';
    const TG_BOT_TOKEN = env.TG_BOT_TOKEN;
    const TG_CHAT_ID = env.TG_CHAT_ID;

    switch (pathname) {
      case '/':
        return await handleRootRequest(request, USERNAME, PASSWORD, enableAuth);
      case `/${adminPath}`:
        return await handleAdminRequest(DATABASE, request, USERNAME, PASSWORD);
      case '/upload':
        return request.method === 'POST' ? await handleUploadRequest(request, DATABASE, enableAuth, USERNAME, PASSWORD, domain, TG_BOT_TOKEN, TG_CHAT_ID) : new Response('Method Not Allowed', { status: 405 });
      case '/bing-images':
        return handleBingImagesRequest();
      case '/delete-images':
        return handleDeleteImagesRequest(request, DATABASE);
      default:
        return await handleImageRequest(request, DATABASE, TG_BOT_TOKEN);
    }
  }
};

let isAuthenticated = false;

function authenticate(request, USERNAME, PASSWORD) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  return isValidCredentials(authHeader, USERNAME, PASSWORD);
}

async function handleRootRequest(request, USERNAME, PASSWORD, enableAuth) {
  const cache = caches.default;
  const cacheKey = new Request(request.url);
  if (enableAuth) {
      if (!authenticate(request, USERNAME, PASSWORD)) {
          return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
      }
  }
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
      return cachedResponse;
  }
  const response = new Response(`
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Telegraph图床-基于Workers的图床服务">
  <meta name="keywords" content="Telegraph图床,Workers图床, Cloudflare, Workers,telegra.ph, 图床">
  <title>Telegraph图床-基于Workers的图床服务</title>
  <link rel="icon" href="https://p1.meituan.net/csc/c195ee91001e783f39f41ffffbbcbd484286.ico" type="image/x-icon">
  <link href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/twitter-bootstrap/4.6.1/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/css/fileinput.min.css" rel="stylesheet" />
  <link href="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/toastr.js/2.1.4/toastr.min.css" rel="stylesheet" />
  <link href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/font-awesome/5.15.4/css/all.min.css" type="text/css" rel="stylesheet" />
  <style>
      body {
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          position: relative;
      }
      .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          z-index: -1;
          transition: opacity 1s ease-in-out;
          opacity: 1;
      }
      .card {
          background-color: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          padding: 20px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          margin: 0 auto;
          position: relative;
      }
      .uniform-height {
          margin-top: 20px;
      }
      #viewCacheBtn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: rgba(0, 0, 0, 0.1);
          cursor: pointer;
          font-size: 24px;
          transition: color 0.3s ease;
      }
      #viewCacheBtn:hover {
          color: rgba(0, 0, 0, 0.4);
      }
      #cacheContent {
          margin-top: 20px;
          max-height: 200px;
          border-radius: 5px;
          overflow-y: auto;
      }
      .cache-title {
          text-align: left;
          margin-bottom: 10px;
      }
      .cache-item {
          display: block;
          cursor: pointer;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease;
          text-align: left;
          padding: 10px;
      }
      .cache-item:hover {
          background-color: #e9ecef;
      }
      .project-link {
          font-size: 14px;
          text-align: center;
          margin-top: 5px;
          margin-bottom: 0;
      }
      textarea.form-control {
          max-height: 200px;
          overflow-y: hidden;
          resize: none;
      }
  </style>
</head>
<body>
  <div class="background" id="background"></div>
  <div class="card">
      <div class="title">Telegraph图床</div>
      <button type="button" class="btn" id="viewCacheBtn" title="查看历史记录"><i class="fas fa-clock"></i></button>
      <div class="card-body">
          <form id="uploadForm" action="/upload" method="post" enctype="multipart/form-data">
              <div class="file-input-container">
                  <input id="fileInput" name="file" type="file" class="form-control-file" data-browse-on-zone-click="true" multiple>
              </div>
              <div class="form-group mb-3 uniform-height" style="display: none;">
                  <button type="button" class="btn btn-light mr-2" id="urlBtn">URL</button>
                  <button type="button" class="btn btn-light mr-2" id="bbcodeBtn">BBCode</button>
                  <button type="button" class="btn btn-light" id="markdownBtn">Markdown</button>
              </div>
              <div class="form-group mb-3 uniform-height" style="display: none;">
                  <textarea class="form-control" id="fileLink" readonly></textarea>
              </div>
              <div id="cacheContent" style="display: none;"></div>
          </form>
      </div>
      <p class="project-link">项目开源于 GitHub - <a href="https://github.com/0-RTT/telegraph" target="_blank" rel="noopener noreferrer">0-RTT/telegraph</a></p>
      <script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js" type="application/javascript"></script>
      <script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/js/fileinput.min.js" type="application/javascript"></script>
      <script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/js/locales/zh.min.js" type="application/javascript"></script>
      <script src="https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/toastr.js/2.1.4/toastr.min.js" type="application/javascript"></script>
      <script>
          async function fetchBingImages() {
              const response = await fetch('/bing-images');
              const data = await response.json();
              return data.data.map(image => image.url);
          }

          async function setBackgroundImages() {
              const images = await fetchBingImages();
              const backgroundDiv = document.getElementById('background');
              if (images.length > 0) {
                  backgroundDiv.style.backgroundImage = 'url(' + images[0] + ')';
              }
              let index = 0;
              let currentBackgroundDiv = backgroundDiv;
              setInterval(() => {
                  const nextIndex = (index + 1) % images.length;
                  const nextBackgroundDiv = document.createElement('div');
                  nextBackgroundDiv.className = 'background next';
                  nextBackgroundDiv.style.backgroundImage = 'url(' + images[nextIndex] + ')';
                  document.body.appendChild(nextBackgroundDiv);
                  nextBackgroundDiv.style.opacity = 0;
                  setTimeout(() => {
                      nextBackgroundDiv.style.opacity = 1;
                  }, 50);
                  setTimeout(() => {
                      document.body.removeChild(currentBackgroundDiv);
                      currentBackgroundDiv = nextBackgroundDiv;
                      index = nextIndex;
                  }, 1000);
              }, 5000);
          }

          $(document).ready(function() {
              let originalImageURLs = [];
              let isCacheVisible = false;
              initFileInput();
              setBackgroundImages();

              function initFileInput() {
                  $("#fileInput").fileinput({
                      theme: 'fa',
                      language: 'zh',
                      browseClass: "btn btn-primary",
                      removeClass: "btn btn-danger",
                      showUpload: false,
                      showPreview: false,
                  }).on('filebatchselected', handleFileSelection)
                    .on('fileclear', handleFileClear);
              }

              async function handleFileSelection() {
                  const files = $('#fileInput')[0].files;
                  for (let i = 0; i < files.length; i++) {
                      await uploadFile(files[i]);
                  }
              }

              async function uploadFile(file) {
                  try {
                      toastr.info('上传中...', '', { timeOut: 0 });
                      const interfaceInfo = {
                          acceptTypes: 'image/*,video/*',
                          maxFileSize: 20 * 1024 * 1024
                      };
                      const acceptedTypes = interfaceInfo.acceptTypes.split(',');
                      const isAcceptedType = acceptedTypes.some(type => {
                          return type.includes('*') ? file.type.startsWith(type.split('/')[0]) : file.type === type;
                      });
                      if (!isAcceptedType) {
                          toastr.error('仅支持图片或视频格式的文件。');
                          return;
                      }
                      if (file.size > interfaceInfo.maxFileSize) {
                          if (file.type.startsWith('video/') || file.type === 'image/gif') {
                              toastr.error('文件必须≤20MB');
                              return;
                          } else {
                              toastr.info('正在压缩...', '', { timeOut: 0 });
                              const compressedFile = await compressImage(file);
                              file = compressedFile;
                          }
                      }
                      const formData = new FormData($('#uploadForm')[0]);
                      formData.set('file', file, file.name);
                      const uploadResponse = await fetch('/upload', { method: 'POST', body: formData });
                      const responseData = await handleUploadResponse(uploadResponse);
                      if (responseData.error) {
                          toastr.error(responseData.error);
                      } else {
                          originalImageURLs.push(responseData.data);
                          $('#fileLink').val(originalImageURLs.join('\\n\\n'));
                          $('.form-group').show();
                          adjustTextareaHeight($('#fileLink')[0]);
                          toastr.success('文件上传成功！');
                          saveToLocalCache(responseData.data, file.name);
                      }
                  } catch (error) {
                      console.error('处理文件时出现错误:', error);
                      $('#fileLink').val('文件处理失败！');
                      toastr.error('文件处理失败！');
                  } finally {
                      toastr.clear();
                  }
              }

              async function handleUploadResponse(response) {
                  if (response.ok) {
                      return await response.json();
                  } else {
                      const errorData = await response.json();
                      return { error: errorData.error };
                  }
              }

              $(document).on('paste', function(event) {
                  const clipboardData = event.originalEvent.clipboardData;
                  if (clipboardData && clipboardData.items) {
                      for (let i = 0; i < clipboardData.items.length; i++) {
                          const item = clipboardData.items[i];
                          if (item.kind === 'file') {
                              const pasteFile = item.getAsFile();
                              uploadFile(pasteFile);
                              break;
                          }
                      }
                  }
              });

              async function compressImage(file, quality = 0.5, maxResolution = 20000000) {
                  return new Promise((resolve) => {
                      const image = new Image();
                      image.onload = () => {
                          const width = image.width;
                          const height = image.height;
                          const resolution = width * height;
                          let scale = 1;
                          if (resolution > maxResolution) {
                              scale = Math.sqrt(maxResolution / resolution);
                          }
                          const targetWidth = Math.round(width * scale);
                          const targetHeight = Math.round(height * scale);
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          canvas.width = targetWidth;
                          canvas.height = targetHeight;
                          ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
                          canvas.toBlob((blob) => {
                              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                              toastr.success('图片压缩成功！');
                              resolve(compressedFile);
                          }, 'image/jpeg', quality);
                      };
                      const reader = new FileReader();
                      reader.onload = (event) => {
                          image.src = event.target.result;
                      };
                      reader.readAsDataURL(file);
                  });
              }

              $('#urlBtn, #bbcodeBtn, #markdownBtn').on('click', function() {
                  const fileLinks = originalImageURLs.map(url => url.trim()).filter(url => url !== '');
                  if (fileLinks.length > 0) {
                      let formattedLinks = '';
                      switch ($(this).attr('id')) {
                          case 'urlBtn':
                              formattedLinks = fileLinks.join('\\n\\n');
                              break;
                          case 'bbcodeBtn':
                              formattedLinks = fileLinks.map(url => '[img]' + url + '[/img]').join('\\n\\n');
                              break;
                          case 'markdownBtn':
                              formattedLinks = fileLinks.map(url => '![image](' + url + ')').join('\\n\\n');
                              break;
                          default:
                              formattedLinks = fileLinks.join('\\n');
                      }
                      $('#fileLink').val(formattedLinks);
                      adjustTextareaHeight($('#fileLink')[0]);
                      copyToClipboardWithToastr(formattedLinks);
                  }
              });

              function handleFileClear(event) {
                  $('#fileLink').val('');
                  adjustTextareaHeight($('#fileLink')[0]);
                  hideButtonsAndTextarea();
                  originalImageURLs = [];
              }

              function adjustTextareaHeight(textarea) {
                textarea.style.height = '1px';
                textarea.style.height = (textarea.scrollHeight > 200 ? 200 : textarea.scrollHeight) + 'px';
                
                if (textarea.scrollHeight > 200) {
                    textarea.style.overflowY = 'auto';
                } else {
                    textarea.style.overflowY = 'hidden';
                }
            }            

              function copyToClipboardWithToastr(text) {
                  const input = document.createElement('textarea');
                  input.value = text;
                  document.body.appendChild(input);
                  input.select();
                  document.execCommand('copy');
                  document.body.removeChild(input);
                  toastr.success('已复制到剪贴板', '', { timeOut: 300 });
              }

              function hideButtonsAndTextarea() {
                  $('#urlBtn, #bbcodeBtn, #markdownBtn, #fileLink').parent('.form-group').hide();
              }

              function saveToLocalCache(url, fileName) {
                  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
                  const cacheData = JSON.parse(localStorage.getItem('uploadCache')) || [];
                  cacheData.push({ url, fileName, timestamp });
                  localStorage.setItem('uploadCache', JSON.stringify(cacheData));
              }

              $('#viewCacheBtn').on('click', function() {
                  const cacheData = JSON.parse(localStorage.getItem('uploadCache')) || [];
                  const cacheContent = $('#cacheContent');
                  cacheContent.empty();
                  if (isCacheVisible) {
                      cacheContent.hide();
                      $('#fileLink').val('');
                      $('#fileLink').parent('.form-group').hide();
                      isCacheVisible = false;
                  } else {
                      if (cacheData.length > 0) {
                          cacheData.reverse();
                          cacheData.forEach((item) => {
                              const listItem = $('<div class="cache-item"></div>')
                                  .text(item.timestamp + ' - ' + item.fileName)
                                  .data('url', item.url);
                              cacheContent.append(listItem);
                              cacheContent.append('<br>');
                          });
                          cacheContent.show();
                      } else {
                          cacheContent.append('<div>还没有记录哦！</div>').show();
                      }
                      isCacheVisible = true;
                  }
              });

              $(document).on('click', '.cache-item', function() {
                  const url = $(this).data('url');
                  originalImageURLs = [];
                  $('#fileLink').val('');
                  originalImageURLs.push(url);
                  $('#fileLink').val(originalImageURLs.map(url => url.trim()).join('\\n\\n'));
                  $('.form-group').show();
                  adjustTextareaHeight($('#fileLink')[0]);
              });
          });
      </script>
</body>
</html>  
`, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  await cache.put(cacheKey, response.clone());
  return response;
}

async function handleAdminRequest(DATABASE, request, USERNAME, PASSWORD) {
  if (!authenticate(request, USERNAME, PASSWORD)) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
  }
  return await generateAdminPage(DATABASE);
}

function isValidCredentials(authHeader, USERNAME, PASSWORD) {
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials).split(':');
  const username = credentials[0];
  const password = credentials[1];
  return username === USERNAME && password === PASSWORD;
}

async function generateAdminPage(DATABASE) {
  const mediaData = await fetchMediaData(DATABASE);
  const mediaHtml = mediaData.map(({ url }) => {
    const fileExtension = url.split('.').pop().toLowerCase();
    const timestamp = url.split('/').pop().split('.')[0];
    if (fileExtension === 'mp4') {
      return `
      <div class="media-container" data-key="${url}" onclick="toggleImageSelection(this)">
        <div class="media-type">视频</div>
        <video class="gallery-video" style="width: 100%; height: 100%; object-fit: contain;" data-src="${url}" controls>
          <source src="${url}" type="video/mp4">
          您的浏览器不支持视频标签。
        </video>
        <div class="upload-time">上传时间: ${new Date(parseInt(timestamp)).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</div>
      </div>
      `;
    } else {
      return `
      <div class="image-container" data-key="${url}" onclick="toggleImageSelection(this)">
        <img data-src="${url}" alt="Image" class="gallery-image lazy">
        <div class="upload-time">上传时间: ${new Date(parseInt(timestamp)).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</div>
      </div>
      `;
    }
  }).join('');
  
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>图库</title>
      <link rel="icon" href="https://p1.meituan.net/csc/c195ee91001e783f39f41ffffbbcbd484286.ico" type="image/x-icon">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
      }
      .header {
        position: sticky;
        top: 0;
        background-color: #ffffff;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }
      .image-container, .media-container {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        aspect-ratio: 1 / 1;
        transition: transform 0.3s, box-shadow 0.3s;
      }
      .media-type {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 10;
        cursor: pointer;
      }
      .image-container .upload-time, .media-container .upload-time {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background-color: rgba(255, 255, 255, 0.7);
        padding: 5px;
        border-radius: 5px;
        color: #000;
        font-size: 14px;
        z-index: 10;
        display: none;
      }
      .image-container:hover, .media-container:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }
      .gallery-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: opacity 0.3s;
        opacity: 0;
      }
      .gallery-image.loaded {
        opacity: 1;
      }
      .media-container.selected, .image-container.selected {
        border: 2px solid #007bff;
        background-color: rgba(0, 123, 255, 0.1);
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 18px;
        color: #555;
      }
      .delete-button {
        background-color: #ff4d4d;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color 0.3s;
        width: auto;
      }
      .delete-button:hover {
        background-color: #ff1a1a;
      }
      .hidden {
        display: none;
      }
      @media (max-width: 600px) {
        .gallery {
          grid-template-columns: repeat(2, 1fr);
        }
        .header {
          flex-direction: row;
          align-items: center;
        }
        .header-right {
          margin-left: auto;
        }
        .footer {
          font-size: 16px;
        }
        .delete-button {
          width: 100%;
          margin-top: 10px;
        }
      }
      </style>
      <script>
        let selectedCount = 0;
        const selectedKeys = new Set();
        function toggleImageSelection(container) {
          const key = container.getAttribute('data-key');
          container.classList.toggle('selected');
          const uploadTime = container.querySelector('.upload-time');
          if (container.classList.contains('selected')) {
            selectedKeys.add(key);
            selectedCount++;
            uploadTime.style.display = 'block';
          } else {
            selectedKeys.delete(key);
            selectedCount--;
            uploadTime.style.display = 'none';
          }
          updateDeleteButton();
        }
        function updateDeleteButton() {
          const deleteButton = document.getElementById('delete-button');
          const countDisplay = document.getElementById('selected-count');
          countDisplay.textContent = selectedCount;
          const headerRight = document.querySelector('.header-right');
          if (selectedCount > 0) {
            headerRight.classList.remove('hidden');
          } else {
            headerRight.classList.add('hidden');
          }
        }
        async function deleteSelectedImages() {
          if (selectedKeys.size === 0) return;
          const response = await fetch('/delete-images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(Array.from(selectedKeys))
          });
          if (response.ok) {
            alert('选中的媒体已删除');
            location.reload();
          } else {
            alert('删除失败');
          }
        }
        document.addEventListener('DOMContentLoaded', () => {
          const images = document.querySelectorAll('.gallery-image[data-src]');
          const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
          };
          const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
                observer.unobserve(img);
              }
            });
          }, options);
          images.forEach(image => {
            imageObserver.observe(image);
          });
        });
      </script>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <span>媒体文件 ${mediaData.length} 个</span>
          <span>已选中: <span id="selected-count">0</span>个</span>
        </div>
        <div class="header-right hidden">          
          <button id="delete-button" class="delete-button" onclick="deleteSelectedImages()">删除选中</button>
        </div>
      </div>
      <div class="gallery">
        ${mediaHtml}
      </div>
      <div class="footer">
        到底啦
      </div>
    </body>
  </html>
  `;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function fetchMediaData(DATABASE) {
  const result = await DATABASE.prepare('SELECT url, fileId FROM media').all();
  const mediaData = result.results.map(row => {
    const timestamp = parseInt(row.url.split('/').pop().split('.')[0]);
    return { fileId: row.fileId, url: row.url, timestamp: timestamp };
  });
  mediaData.sort((a, b) => b.timestamp - a.timestamp);
  return mediaData.map(({ fileId, url }) => ({ fileId, url }));
}

async function handleUploadRequest(request, DATABASE, enableAuth, USERNAME, PASSWORD, domain, TG_BOT_TOKEN, TG_CHAT_ID) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) throw new Error('缺少文件');
    if (enableAuth && !authenticate(request, USERNAME, PASSWORD)) {
      return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
    }
    const uploadFormData = new FormData();
    uploadFormData.append("chat_id", TG_CHAT_ID);
    let fileId;
    if (file.type.startsWith('image/gif')) {
      const newFileName = file.name.replace(/\.gif$/, '.jpeg');
      const newFile = new File([file], newFileName, { type: 'image/jpeg' });
      uploadFormData.append("document", newFile);
    } else {
      uploadFormData.append("document", file);
    }
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument`, { method: 'POST', body: uploadFormData });
    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      throw new Error(errorData.description || '上传到 Telegram 失败');
    }
    const responseData = await telegramResponse.json();
    if (responseData.result.video) fileId = responseData.result.video.file_id;
    else if (responseData.result.document) fileId = responseData.result.document.file_id;
    else if (responseData.result.sticker) fileId = responseData.result.sticker.file_id;
    else throw new Error('返回的数据中没有文件 ID');
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const imageURL = `https://${domain}/${timestamp}.${fileExtension}`;
    await DATABASE.prepare('INSERT INTO media (url, fileId) VALUES (?, ?) ON CONFLICT(url) DO NOTHING').bind(imageURL, fileId).run();
    return new Response(JSON.stringify({ data: imageURL }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('内部服务器错误:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

async function handleImageRequest(request, DATABASE, TG_BOT_TOKEN) {
  const requestedUrl = request.url;
  const cache = caches.default;
  const cacheKey = new Request(requestedUrl);
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;
  const result = await DATABASE.prepare('SELECT fileId FROM media WHERE url = ?').bind(requestedUrl).first();
  if (result) {
    const fileId = result.fileId;
    const getFileResponse = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile?file_id=${fileId}`);
    if (!getFileResponse.ok) return new Response(null, { status: 404 });
    const fileData = await getFileResponse.json();
    const filePath = fileData.result.file_path;
    const telegramFileUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${filePath}`;
    const response = await fetch(telegramFileUrl);
    if (response.ok) {
      const fileExtension = requestedUrl.split('.').pop().toLowerCase();
      let contentType = 'text/plain';
      if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
      if (fileExtension === 'png') contentType = 'image/png';
      if (fileExtension === 'gif') contentType = 'image/gif';
      if (fileExtension === 'webp') contentType = 'image/webp';
      if (fileExtension === 'mp4') contentType = 'video/mp4';
      const headers = new Headers(response.headers);
      headers.set('Content-Type', contentType);
      headers.set('Content-Disposition', 'inline');
      const responseToCache = new Response(response.body, { status: response.status, headers });
      await cache.put(cacheKey, responseToCache.clone());
      return responseToCache;
    }
  }
  const notFoundResponse = new Response(null, { status: 404 });
  await cache.put(cacheKey, notFoundResponse.clone());
  return notFoundResponse;
}

async function handleBingImagesRequest(request) {
  const cache = caches.default;
  const cacheKey = new Request('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=5');
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;
  const res = await fetch(cacheKey);
  const bingData = await res.json();
  const images = bingData.images.map(image => ({ url: `https://cn.bing.com${image.url}` }));
  const returnData = { status: true, message: "操作成功", data: images };
  const response = new Response(JSON.stringify(returnData), { status: 200, headers: { 'Content-Type': 'application/json' } });
  await cache.put(cacheKey, response.clone());
  return response;
}

async function handleDeleteImagesRequest(request, DATABASE) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const keysToDelete = await request.json();
    if (!Array.isArray(keysToDelete) || keysToDelete.length === 0) {
      return new Response(JSON.stringify({ message: '没有要删除的项' }), { status: 400 });
    }
    const placeholders = keysToDelete.map(() => '?').join(',');
    const result = await DATABASE.prepare(`DELETE FROM media WHERE url IN (${placeholders})`).bind(...keysToDelete).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ message: '未找到要删除的项' }), { status: 404 });
    }
    const cache = caches.default;
    for (const url of keysToDelete) {
      const cacheKey = new Request(url);
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        await cache.delete(cacheKey);
      }
    }
    return new Response(JSON.stringify({ message: '删除成功' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: '删除失败', details: error.message }), { status: 500 });
  }
}
