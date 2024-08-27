const domain = 'example.com';
const adminPath = 'admin'; // 自定义管理路径

const USERNAME = USERNAME_ENV;
const PASSWORD = PASSWORD_ENV;

const sessionStore = new Map();
const SESSION_EXPIRY_TIME = 5 * 60 * 1000;

// 监听 fetch 事件
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 处理请求
async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  switch (pathname) {
    case '/':
      return handleRootRequest(); // 处理根请求
    case `/${adminPath}`:
      return handleAdminRequest(request); // 处理管理请求
    case '/upload':
      return request.method === 'POST' ? handleUploadRequest(request) : new Response('Method Not Allowed', { status: 405 }); // 处理上传请求
    case '/bing-images':
      return handleBingImagesRequest(); // 处理 Bing 图片请求
    case '/delete-images':
      return handleDeleteImagesRequest(request); // 处理删除请求
    default:
      return handleImageRequest(pathname); // 处理图片请求
  }
}

// 处理根请求，返回首页 HTML
function handleRootRequest() {
  return new Response(`
  <!DOCTYPE html>
  <html lang="zh">
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
    <style>
      body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
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
      .background.next {
        opacity: 0;
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
      }
      @media (max-width: 576px) {
        .card {
          margin: 20px;
        }
      }
      .uniform-height {
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
  <div class="background" id="background"></div>
  <div class="card">
    <div class="title">Telegraph图床</div>
    <div class="card-body">
      <form id="uploadForm" action="/upload" method="post" enctype="multipart/form-data">
        <div class="file-input-container">
          <input id="fileInput" name="file" type="file" class="form-control-file" data-browse-on-zone-click="true">
        </div>
        <div class="form-group mb-3 uniform-height" style="display: none;">
          <button type="button" class="btn btn-light mr-2" id="urlBtn">URL</button>
          <button type="button" class="btn btn-light mr-2" id="bbcodeBtn">BBCode</button>
          <button type="button" class="btn btn-light" id="markdownBtn">Markdown</button>
        </div>
        <div class="form-group mb-3 uniform-height" style="display: none;">
          <textarea class="form-control" id="fileLink" readonly></textarea>
        </div>
        <div id="uploadingText" class="uniform-height" style="display: none; text-align: center;">文件上传中...</div>
        <div id="compressingText" class="uniform-height" style="display: none; text-align: center;">图片压缩中...</div>
      </form>
    </div>
    <p style="font-size: 14px; text-align: center;">
      项目开源于 GitHub - <a href="https://github.com/0-RTT/telegraph" target="_blank" rel="noopener noreferrer">0-RTT/telegraph</a>
    </p>
    <script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js" type="application/javascript"></script>
    <script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/js/fileinput.min.js" type="application/javascript"></script>
    <script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/js/locales/zh.min.js" type="application/javascript"></script>
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
          const nextImage = new Image();
          nextImage.src = images[nextIndex];
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
        let originalImageURL = '';
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
          const file = $('#fileInput')[0].files[0];
          if (file) {
            await uploadFile(file);
          }
        }
        async function uploadFile(file) {
          try {
            const interfaceInfo = {
              acceptTypes: 'image/gif,image/jpeg,image/jpg,image/png,video/mp4',
              gifAndVideoMaxSize: 5 * 1024 * 1024,
              otherMaxSize: 5 * 1024 * 1024,
              compressImage: true
            };
            if (['image/gif', 'video/mp4'].includes(file.type)) {
              if (file.size > interfaceInfo.gifAndVideoMaxSize) {
                toastr.error('文件必须≤' + interfaceInfo.gifAndVideoMaxSize / (1024 * 1024) + 'MB');
                return;
              }
            } else {
              if (interfaceInfo.compressImage === true) {
                const compressedFile = await compressImage(file);
                file = compressedFile;
              } else if (interfaceInfo.compressImage === false) {
                if (file.size > interfaceInfo.otherMaxSize) {
                  toastr.error('文件必须≤' + interfaceInfo.otherMaxSize / (1024 * 1024) + 'MB');
                  return;
                }
              }
            }
            $('#uploadingText').show();
            const formData = new FormData($('#uploadForm')[0]);
            formData.set('file', file, file.name);
            const uploadResponse = await fetch('/upload', { method: 'POST', body: formData });
            originalImageURL = await handleUploadResponse(uploadResponse);
            $('#fileLink').val(originalImageURL);
            $('.form-group').show();
            adjustTextareaHeight($('#fileLink')[0]);
          } catch (error) {
            console.error('上传文件时出现错误:', error);
            $('#fileLink').val('文件上传失败！');
          } finally {
            $('#uploadingText').hide();
          }
        }
        async function handleUploadResponse(response) {
          if (response.ok) {
            const result = await response.json();
            return result.data;
          } else {
            return '文件上传失败！';
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
          $('#compressingText').show();
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
                $('#compressingText').hide();
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
          const fileLink = originalImageURL.trim();
          if (fileLink !== '') {
            let formattedLink;
            switch ($(this).attr('id')) {
              case 'urlBtn':
                formattedLink = fileLink;
                break;
              case 'bbcodeBtn':
                formattedLink = '[img]' + fileLink + '[/img]';
                break;
              case 'markdownBtn':
                formattedLink = '![image](' + fileLink + ')';
                break;
              default:
                formattedLink = fileLink;
            }
            $('#fileLink').val(formattedLink);
            adjustTextareaHeight($('#fileLink')[0]);
            copyToClipboardWithToastr(formattedLink);
          }
        });
        function handleFileClear(event) {
          $('#fileLink').val('');
          adjustTextareaHeight($('#fileLink')[0]);
          hideButtonsAndTextarea();
        }
        function adjustTextareaHeight(textarea) {
          textarea.style.height = '1px';
          textarea.style.height = (textarea.scrollHeight) + 'px';
        }
        function copyToClipboardWithToastr(text) {
          const input = document.createElement('input');
          input.setAttribute('value', text);
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          toastr.success('已复制到剪贴板', '', { timeOut: 300 });
        }
        function hideButtonsAndTextarea() {
          $('#urlBtn, #bbcodeBtn, #markdownBtn, #fileLink').parent('.form-group').hide();
        }
      });
    </script>
  </body>
</html>
  `, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// 处理管理请求，进行身份验证
async function handleAdminRequest(request) {
  const authHeader = request.headers.get('Authorization');
  const sessionId = request.headers.get('Session-Id');

  if (sessionId && sessionStore.has(sessionId)) {
    const sessionData = sessionStore.get(sessionId);
    if (Date.now() < sessionData.expiry) {
      return await generateAdminPage(); // 返回管理页面
    } else {
      sessionStore.delete(sessionId); // 删除过期会话
    }
  }
  if (!authHeader || !isValidAuth(authHeader)) {
    return new Response('需要身份验证', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
        'Content-Type': 'text/plain; charset=utf-8' // 添加字符集
      }
    });
  }
  const newSessionId = generateSessionId(); // 生成新会话 ID
  sessionStore.set(newSessionId, { expiry: Date.now() + SESSION_EXPIRY_TIME });
  const response = await generateAdminPage(); // 生成管理页面
  response.headers.set('Session-Id', newSessionId); // 设置会话 ID
  return response;
}

// 生成随机会话 ID
function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

// 生成管理页面的 HTML
async function generateAdminPage() {
  const { keys } = await imgurl.list();
  
  // 并发获取所有图片 URL
  const responses = await Promise.all(keys.map(key => imgurl.get(key.name)));
  
  const imagesHtml = responses.map((value, index) => {
    if (value) {
      const key = keys[index].name;
      return `
      <div class="image-container" data-key="${key}" onclick="toggleImageSelection(this)">
          <img data-src="${value}" alt="Image" class="gallery-image lazy">
      </div>
      `;
    }
    return '';
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
              grid-template-columns: repeat(4, 1fr); /* 每行4张图片 */
              gap: 20px;
          }
          .image-container {
              position: relative;
              overflow: hidden;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              aspect-ratio: 16 / 9;
          }
          .gallery-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.2s;
              opacity: 0; /* 初始透明度为0 */
              transition: opacity 0.3s; /* 过渡效果 */
          }
          .gallery-image.loaded {
              opacity: 1; /* 加载完成后设置为不透明 */
          }
          .image-container.selected {
              transform: scale(0.95);
              filter: grayscale(100%);
              border: 2px solid #007bff;
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
          }
          .delete-button:hover {
              background-color: #ff1a1a;
          }
          @media (max-width: 600px) {
              .header {
                  flex-direction: column;
                  align-items: flex-start;
              }
              .header-right {
                  margin-top: 10px;
              }
              .footer {
                  font-size: 16px;
              }
          }
      </style>
      <script>
          let selectedCount = 0;
          const selectedKeys = new Set(); // 用于存储选中的键

          function toggleImageSelection(container) {
              const key = container.getAttribute('data-key');
              container.classList.toggle('selected');
              if (container.classList.contains('selected')) {
                  selectedKeys.add(key);
                  selectedCount++;
              } else {
                  selectedKeys.delete(key);
                  selectedCount--;
              }
              updateDeleteButton();
          }

          function updateDeleteButton() {
              const deleteButton = document.getElementById('delete-button');
              const countDisplay = document.getElementById('selected-count');
              countDisplay.textContent = selectedCount;
              deleteButton.classList.toggle('show', selectedCount > 0);
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
                  alert('选中的图片已删除');
                  location.reload(); // 刷新页面以更新图片列表
              } else {
                  alert('删除失败');
              }
          }

          // 懒加载实现
          document.addEventListener('DOMContentLoaded', () => {
              const images = document.querySelectorAll('.gallery-image[data-src]');
              const options = {
                  root: null, // 使用视口作为根
                  rootMargin: '0px',
                  threshold: 0.1 // 10% 可见时触发
              };

              const imageObserver = new IntersectionObserver((entries, observer) => {
                  entries.forEach(entry => {
                      if (entry.isIntersecting) {
                          const img = entry.target;
                          img.src = img.dataset.src; // 使用 data-src 属性来存储真实的图片 URL
                          img.onload = () => img.classList.add('loaded'); // 加载完成后添加样式
                          observer.unobserve(img); // 停止观察
                      }
                  });
              }, options);

              images.forEach(image => {
                  imageObserver.observe(image); // 开始观察每个图片
              });
          });
      </script>
  </head>
  <body>
      <div class="header">
          <div class="header-left">
              <span>当前共有 ${responses.length} 张图</span>
          </div>
          <div class="header-right">
              <span>选中数量: <span id="selected-count">0</span></span>
              <button id="delete-button" class="delete-button" onclick="deleteSelectedImages()">删除选中</button>
          </div>
      </div>
      <div class="gallery">
          ${imagesHtml}
      </div>
      <div class="footer">
          到底啦
      </div>
  </body>
  </html>
  `;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// 验证身份
function isValidAuth(authHeader) {
  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic') return false;
  const decoded = atob(encoded);
  const [username, password] = decoded.split(':');
  return username === USERNAME && password === PASSWORD;
}

// 处理文件上传请求
async function handleUploadRequest(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) throw new Error('缺少文件');
    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('上传失败');
    const responseData = await response.json();
    const imageKey = responseData[0].src;
    const imageURL = `https://${domain}${imageKey}`;
    await imgurl.put(imageKey, imageURL);
    return new Response(JSON.stringify({ data: imageURL }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('内部服务器错误:', error);
    return new Response(JSON.stringify({ error: '内部服务器错误' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// 处理 Bing 图片请求
async function handleBingImagesRequest() {
  const res = await fetch(`https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=5`);
  const bing_data = await res.json();
  const images = bing_data.images.map(image => ({
    url: `https://cn.bing.com${image.url}`
  }));
  const return_data = {
    status: true,
    message: "操作成功",
    data: images
  };
  return new Response(JSON.stringify(return_data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 处理图片请求
async function handleImageRequest(pathname) {
  const foundValue = await imgurl.get(pathname);
  if (foundValue) {
    const url = new URL(foundValue);
    url.hostname = 'telegra.ph'; // 确保请求的主机名是 telegra.ph
    return fetch(url); // 返回图片内容
  }
  // 直接返回 404 响应
  return new Response(null, { status: 404 }); // 返回空响应和 404 状态码
}

// 处理删除请求
async function handleDeleteImagesRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  try {
    const keysToDelete = await request.json();
    for (const key of keysToDelete) {
      await imgurl.delete(key); // 从 KV 中删除图片
    }
    return new Response(JSON.stringify({ message: '删除成功' }), { status: 200 });
  } catch (error) {
    console.error('删除图片时出错:', error);
    return new Response(JSON.stringify({ error: '删除失败' }), { status: 500 });
  }
}
