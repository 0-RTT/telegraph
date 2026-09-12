const CONTENT_TYPE_MAP = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'svg': 'image/svg+xml',
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'webm': 'video/webm'
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(CONTENT_TYPE_MAP));

const CACHE_CONFIG = {
  HTML: 3600,
  IMAGE: 86400,
  API: 300
};

function extractConfig(env) {
  return {
    domain: env.DOMAIN,
    database: env.DATABASE,
    username: env.USERNAME,
    password: env.PASSWORD,
    adminPath: env.ADMIN_PATH || 'admin',
    enableAuth: env.ENABLE_AUTH === 'true',
    tgBotToken: env.TG_BOT_TOKEN,
    tgChatId: env.TG_CHAT_ID,
    maxSize: (env.MAX_SIZE_MB ? parseInt(env.MAX_SIZE_MB, 10) : 20) * 1024 * 1024
  };
}

function createCachedResponse(body, contentType, cacheMaxAge) {
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
      'CDN-Cache-Control': `public, max-age=${cacheMaxAge}`
    }
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

function unauthorizedResponse() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
  });
}

function getFileExtension(url) {
  try {
    const pathname = new URL(url, 'https://x').pathname;
    const dot = pathname.lastIndexOf('.');
    return dot > 0 ? pathname.slice(dot + 1).toLowerCase() : '';
  } catch {
    return '';
  }
}

function getContentType(extension) {
  return CONTENT_TYPE_MAP[extension] || 'application/octet-stream';
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function authenticate(request, username, password) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;
  try {
    const credentials = atob(authHeader.slice(6)).split(':');
    return credentials[0] === username && credentials[1] === password;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  async fetch(request, env) {
    try {
      const urlObj = new URL(request.url);
      const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
      const config = extractConfig(env);

      switch (pathname) {
        case '/':
          return await handleRootRequest(request, config);
        case `/${config.adminPath}`:
          return await handleAdminRequest(request, config);
        case '/upload':
          return request.method === 'POST'
            ? await handleUploadRequest(request, config)
            : new Response('Method Not Allowed', { status: 405 });
        case '/bing-images':
          return await handleBingImagesRequest();
        case '/delete-images':
          return await handleDeleteImagesRequest(request, config);
        default:
          return await handleImageRequest(request, config);
      }
    } catch (err) {
      console.error('Unhandled error:', err && err.stack || err);
      return jsonResponse({ error: 'Internal Server Error' }, 500);
    }
  }
};

async function handleRootRequest(request, config) {
  if (config.enableAuth && !authenticate(request, config.username, config.password)) {
    return unauthorizedResponse();
  }

  const cache = caches.default;
  const urlObj = new URL(request.url);
  const cacheKey = new Request(`${urlObj.origin}/`);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const response = createCachedResponse(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="JSimages-基于CloudFlare的图床服务">
<meta name="keywords" content="JSimages,Workers图床,Telegram,图床,Cloudflare,Workers">
<title>JSimages-基于CloudFlare的图床服务</title>
<link rel="icon" href="https://p1.meituan.net/csc/c195ee91001e783f39f41ffffbbcbd484286.ico" type="image/x-icon">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    position: relative;
  }
  [hidden] { display: none !important; }

  .background {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-size: cover;
    background-position: center;
    z-index: -1;
    transition: opacity 1s ease-in-out;
    opacity: 1;
  }

  .card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    padding: 30px;
    width: 100%;
    max-width: 480px;
    text-align: center;
    position: relative;
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }

  .icon-btn {
    position: absolute;
    top: 15px;
    background: none;
    border: none;
    color: rgba(102, 126, 234, 0.5);
    cursor: pointer;
    padding: 4px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
  }
  .icon-btn:hover { color: #667eea; transform: scale(1.1); }
  .icon-btn:focus-visible { outline: 2px solid #667eea; outline-offset: 2px; border-radius: 6px; }
  .icon-btn svg { width: 22px; height: 22px; display: block; }
  #viewCacheBtn { right: 15px; }
  #compressionToggleBtn { right: 55px; }

  .upload-area {
    display: block;
    position: relative;
    border: 2px dashed #667eea;
    border-radius: 12px;
    background: rgba(102, 126, 234, 0.05);
    padding: 30px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }
  .upload-area:hover {
    border-color: #764ba2;
    background: rgba(102, 126, 234, 0.1);
  }
  .upload-area.dragover {
    border-color: #764ba2;
    background: rgba(102, 126, 234, 0.18);
    transform: scale(1.01);
  }
  .upload-area:focus-within {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
  .upload-area svg.upload-icon {
    width: 40px; height: 40px;
    color: #667eea;
    margin-bottom: 10px;
  }
  .upload-text { color: #667eea; font-size: 15px; font-weight: 500; }
  .upload-sub { color: #999; font-size: 12px; margin-top: 6px; }

  .upload-area input[type="file"] {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .upload-hint {
    color: #999;
    font-size: 14px;
    margin-top: 15px;
    line-height: 1.6;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .upload-hint svg { width: 16px; height: 16px; color: #667eea; flex-shrink: 0; }

  .form-group { margin-top: 20px; }

  .btn {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    margin: 0 4px;
  }
  .btn:focus-visible { outline: 2px solid #667eea; outline-offset: 2px; }
  .btn-light { background: #f0f2f8; color: #555; }
  .btn-light:hover { background: #e0e4f0; transform: translateY(-2px); }

  .link-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e4e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    max-height: 200px;
    overflow-y: hidden;
    outline: none;
    transition: border-color 0.2s;
    color: #333;
    background: #fff;
  }
  .link-textarea:focus { border-color: #667eea; }

  .upload-progress { display: none; margin-top: 15px; text-align: center; }
  .upload-progress.show { display: block; }
  .progress-text { font-size: 14px; font-weight: 500; color: #667eea; letter-spacing: 0.5px; }

  .thumbnail-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
  }
  .thumbnail-item {
    position: relative;
    width: 80px; height: 80px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }
  .thumbnail-item:hover { transform: scale(1.05); }
  .thumbnail-item img,
  .thumbnail-item video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumbnail-item .file-icon {
    width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
  .thumbnail-item .remove-btn {
    position: absolute;
    top: 2px; right: 2px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    padding: 0;
  }
  .thumbnail-item:hover .remove-btn { opacity: 1; }

  .cache-content {
    margin-top: 20px;
    max-height: 250px;
    overflow-y: auto;
    border-radius: 8px;
  }
  .cache-item {
    display: block;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    text-align: left;
    padding: 12px 15px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid rgba(102, 126, 234, 0.1);
    font-size: 13px;
    color: #555;
    word-break: break-all;
  }
  .cache-item:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateX(5px);
  }
  .cache-empty {
    text-align: center;
    color: #999;
    padding: 20px;
    font-size: 14px;
  }

  .project-link {
    font-size: 14px;
    text-align: center;
    margin-top: 15px;
    margin-bottom: 0;
    color: #999;
    line-height: 1.6;
  }
  .project-link a { color: #667eea; text-decoration: none; transition: color 0.3s ease; }
  .project-link a:hover { color: #764ba2; text-decoration: underline; }

  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }
  .toast {
    background: rgba(50, 50, 50, 0.95);
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transform: translateX(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    max-width: 320px;
    word-break: break-word;
    line-height: 1.5;
  }
  .toast-show { opacity: 1; transform: translateX(0); }
  .toast-success { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); }
  .toast-error   { background: linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%); }
  .toast-info    { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .toast-warning { background: linear-gradient(135deg, #faad14 0%, #d48806 100%); }

  @media (max-width: 768px) {
    .card { padding: 20px; border-radius: 12px; }
    .title { font-size: 24px; }
    .icon-btn svg { width: 20px; height: 20px; }
    .toast-container { top: 10px; right: 10px; left: 10px; }
    .toast { max-width: none; }
  }
</style>
</head>
<body>
  <div class="background" id="bg1"></div>
  <div class="background" id="bg2" style="opacity: 0;"></div>

  <div class="card">
    <div class="title">JSimages</div>

    <button type="button" class="icon-btn" id="viewCacheBtn" title="查看历史记录" aria-label="查看历史记录">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    </button>

    <button type="button" class="icon-btn" id="compressionToggleBtn" aria-label="切换压缩">
      <svg id="compressIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>
      </svg>
    </button>

    <label class="upload-area" id="uploadArea">
      <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <div class="upload-text">点击选择文件 / 拖拽到此处</div>
      <div class="upload-sub">支持多文件 · Ctrl+V 粘贴</div>
      <input type="file" id="fileInput" multiple aria-label="选择要上传的文件">
    </label>

    <div class="upload-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>支持多文件上传 · Ctrl+V 粘贴上传</span>
    </div>

    <div class="form-group" id="formatButtons" hidden>
      <button type="button" class="btn btn-light" data-format="url">URL</button>
      <button type="button" class="btn btn-light" data-format="bbcode">BBCode</button>
      <button type="button" class="btn btn-light" data-format="markdown">Markdown</button>
    </div>

    <div class="form-group" id="linkGroup" hidden>
      <textarea class="link-textarea" id="fileLink" readonly placeholder="上传成功后的链接会显示在这里"></textarea>
    </div>

    <div class="upload-progress" id="uploadProgress">
      <div class="progress-text" id="progressText">上传中... 0%</div>
    </div>

    <div class="thumbnail-container" id="thumbnailContainer"></div>
    <div class="cache-content" id="cacheContent" hidden></div>

    <p class="project-link">
      项目开源于 GitHub -
      <a href="https://github.com/0-RTT/JSimages" target="_blank" rel="noopener noreferrer">0-RTT/JSimages</a>
    </p>
  </div>

  <div class="toast-container" id="toastContainer" role="status" aria-live="polite"></div>

  <script>
  (function () {
    'use strict';

    let originalImageURLs = [];
    let thumbnailData = [];
    let isCacheVisible = false;
    let enableCompression = true;
    let uploadCache = JSON.parse(localStorage.getItem('uploadCache') || '[]');

    function showToast(message, type, duration) {
      type = type || 'info';
      duration = duration === undefined ? 2500 : duration;
      const container = document.getElementById('toastContainer');
      const el = document.createElement('div');
      el.className = 'toast toast-' + type;
      el.textContent = message;
      container.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('toast-show'); });

      let timer = null;
      let closed = false;
      function close() {
        if (closed) return;
        closed = true;
        if (timer) clearTimeout(timer);
        el.classList.remove('toast-show');
        setTimeout(function () { el.remove(); }, 300);
      }
      if (duration > 0) timer = setTimeout(close, duration);
      return { close: close };
    }

    const COMPRESS_PATH = '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>';
    const EXPAND_PATH   = '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>';

    function refreshCompressionBtn() {
      const icon = document.getElementById('compressIcon');
      const btn = document.getElementById('compressionToggleBtn');
      if (enableCompression) {
        icon.innerHTML = COMPRESS_PATH;
        btn.title = '点击关闭压缩';
      } else {
        icon.innerHTML = EXPAND_PATH;
        btn.title = '点击开启压缩';
      }
    }

    document.getElementById('compressionToggleBtn').addEventListener('click', function () {
      enableCompression = !enableCompression;
      refreshCompressionBtn();
    });

    async function fetchBingImages() {
      try {
        const res = await fetch('/bing-images');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        return (data.data || []).map(function (i) { return i.url; });
      } catch (e) {
        console.error('获取Bing背景图片失败:', e);
        return [];
      }
    }

    async function setBackgroundImages() {
      const images = await fetchBingImages();
      if (images.length === 0) return;
      const bg1 = document.getElementById('bg1');
      const bg2 = document.getElementById('bg2');
      bg1.style.backgroundImage = 'url(' + images[0] + ')';
      bg1.style.opacity = 1;
      bg2.style.opacity = 0;
      let index = 0;
      let currentBg = bg1;
      let nextBg = bg2;
      setInterval(function () {
        index = (index + 1) % images.length;
        nextBg.style.backgroundImage = 'url(' + images[index] + ')';
        nextBg.style.opacity = 0;
        setTimeout(function () {
          nextBg.style.opacity = 1;
          currentBg.style.opacity = 0;
        }, 50);
        setTimeout(function () {
          const tmp = currentBg;
          currentBg = nextBg;
          nextBg = tmp;
        }, 1000);
      }, 5000);
    }

    async function calculateFileHash(file) {
      const chunkSize = 1024 * 1024;
      const chunk = file.size > chunkSize ? file.slice(0, chunkSize) : file;
      const arrayBuffer = await chunk.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      return hash + '-' + file.size + '-' + file.lastModified;
    }

    function getCachedData(hash) {
      for (let i = 0; i < uploadCache.length; i++) {
        if (uploadCache[i].hash === hash) return uploadCache[i];
      }
      return null;
    }

    function saveToLocalCache(url, fileName, fileHash) {
      const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
      uploadCache.push({ url: url, fileName: fileName, hash: fileHash, timestamp: timestamp });
      try {
        localStorage.setItem('uploadCache', JSON.stringify(uploadCache));
      } catch (e) {
        console.warn('本地缓存写入失败:', e);
      }
    }

    function addThumbnail(file, url) {
      const container = document.getElementById('thumbnailContainer');
      const index = thumbnailData.length;
      const previewUrl = URL.createObjectURL(file);
      thumbnailData.push({ previewUrl: previewUrl, url: url, file: file });

      const item = document.createElement('div');
      item.className = 'thumbnail-item';
      item.dataset.index = String(index);

      let media;
      if (file.type.indexOf('image/') === 0) {
        media = document.createElement('img');
        media.src = previewUrl;
        media.alt = 'thumbnail';
      } else if (file.type.indexOf('video/') === 0) {
        media = document.createElement('video');
        media.src = previewUrl;
        media.muted = true;
      } else {
        media = document.createElement('div');
        media.className = 'file-icon';
        media.textContent = (file.name.split('.').pop() || '').toUpperCase().slice(0, 5);
      }
      item.appendChild(media);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.type = 'button';
      removeBtn.title = '移除';
      removeBtn.setAttribute('aria-label', '移除');
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeThumbnail(index);
      });
      item.appendChild(removeBtn);

      container.appendChild(item);
    }

    function removeThumbnail(index) {
      const item = thumbnailData[index];
      if (item && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      thumbnailData[index] = null;

      const urlToRemove = item ? item.url : null;
      if (urlToRemove) {
        originalImageURLs = originalImageURLs.filter(function (u) { return u !== urlToRemove; });
        if (originalImageURLs.length === 0) {
          hideButtonsAndTextarea();
          document.getElementById('fileLink').value = '';
        } else {
          updateFileLinkDisplay();
        }
      }
      const el = document.querySelector('.thumbnail-item[data-index="' + index + '"]');
      if (el) el.remove();
    }

    function clearAllThumbnails() {
      thumbnailData.forEach(function (item) {
        if (item && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      thumbnailData = [];
      document.getElementById('thumbnailContainer').innerHTML = '';
    }

    function updateFileLinkDisplay() {
      const ta = document.getElementById('fileLink');
      ta.value = originalImageURLs.join('\\n\\n');
      document.getElementById('formatButtons').hidden = false;
      document.getElementById('linkGroup').hidden = false;
      adjustTextareaHeight(ta);
    }

    function hideButtonsAndTextarea() {
      document.getElementById('formatButtons').hidden = true;
      document.getElementById('linkGroup').hidden = true;
    }

    function adjustTextareaHeight(textarea) {
      textarea.style.height = '1px';
      const h = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = h + 'px';
      textarea.style.overflowY = textarea.scrollHeight > 200 ? 'auto' : 'hidden';
    }

    function fallbackCopy(text, successMessage) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(successMessage || '已复制到剪贴板', 'success', 800);
      } catch (e) {
        showToast('复制失败', 'error');
      }
      document.body.removeChild(ta);
    }

    function copyToClipboard(text, successMessage) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast(successMessage || '已复制到剪贴板', 'success', 800);
        }).catch(function () {
          fallbackCopy(text, successMessage);
        });
      } else {
        fallbackCopy(text, successMessage);
      }
    }

    function formatLinks(urls, format) {
      switch (format) {
        case 'url':      return urls.join('\\n\\n');
        case 'bbcode':   return urls.map(function (u) { return '[img]' + u + '[/img]'; }).join('\\n\\n');
        case 'markdown': return urls.map(function (u) { return '![image](' + u + ')'; }).join('\\n\\n');
        default:         return urls.join('\\n');
      }
    }

    function compressImage(file, quality) {
      quality = quality === undefined ? 0.75 : quality;
      return new Promise(function (resolve, reject) {
        const image = new Image();
        image.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, image.width, image.height);
          canvas.toBlob(function (blob) {
            if (!blob) return reject(new Error('压缩失败'));
            const baseName = file.name.replace(/\\.[^.]+$/, '') || 'image';
            resolve(new File([blob], baseName + '.jpg', { type: 'image/jpeg' }));
          }, 'image/jpeg', quality);
        };
        image.onerror = function () { reject(new Error('图片解码失败')); };
        const reader = new FileReader();
        reader.onload = function (e) { image.src = e.target.result; };
        reader.onerror = function () { reject(new Error('文件读取失败')); };
        reader.readAsDataURL(file);
      });
    }

    function uploadFile(file, fileHash) {
      return (async function () {
        const originalFile = file;
        try {
          if (enableCompression && file.type.indexOf('image/') === 0 && file.type !== 'image/gif') {
            const compressToast = showToast('正在压缩...', 'info', 0);
            try {
              file = await compressImage(file);
            } finally {
              compressToast.close();
            }
          }

          const formData = new FormData();
          formData.append('file', file, file.name);

          const progress = document.getElementById('uploadProgress');
          const progressText = document.getElementById('progressText');
          progress.classList.add('show');
          progressText.textContent = '上传中... 0%';

          const responseData = await new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', function (e) {
              if (e.lengthComputable) {
                const p = Math.round((e.loaded / e.total) * 100);
                progressText.textContent = '上传中... ' + p + '%';
              }
            });
            xhr.onload = function () {
              if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText)); }
                catch (err) { reject(new Error('响应解析失败')); }
              } else {
                try {
                  const e = JSON.parse(xhr.responseText);
                  reject(new Error(e.error || '上传失败'));
                } catch (err) {
                  reject(new Error('上传失败: HTTP ' + xhr.status));
                }
              }
            };
            xhr.onerror = function () { reject(new Error('网络错误，请检查网络连接')); };
            xhr.ontimeout = function () { reject(new Error('上传超时，请重试')); };
            xhr.open('POST', '/upload');
            xhr.timeout = 120000;
            xhr.send(formData);
          });

          progress.classList.remove('show');

          if (responseData.error) {
            showToast(responseData.error, 'error');
          } else {
            originalImageURLs.push(responseData.data);
            addThumbnail(originalFile, responseData.data);
            updateFileLinkDisplay();
            showToast('上传成功! 点击下方按钮复制链接', 'success', 3000);
            saveToLocalCache(responseData.data, file.name, fileHash);
          }
        } catch (error) {
          console.error('处理文件时出现错误:', error);
          document.getElementById('uploadProgress').classList.remove('show');
          let msg = '文件处理失败';
          if (error.message.indexOf('网络') !== -1) msg = '网络错误，请检查网络连接';
          else if (error.message.indexOf('超时') !== -1) msg = '上传超时，请重试';
          else if (error.message) msg = error.message;
          showToast(msg, 'error');
        }
      })();
    }

    async function handleFiles(files) {
      if (!files || files.length === 0) return;
      const queue = Array.from(files);
      const CONCURRENCY = 4;

      async function worker() {
        while (queue.length) {
          const file = queue.shift();
          const fileHash = await calculateFileHash(file);
          const cachedData = getCachedData(fileHash);
          if (cachedData) {
            if (originalImageURLs.indexOf(cachedData.url) === -1) {
              originalImageURLs.push(cachedData.url);
              updateFileLinkDisplay();
              showToast('已从缓存中读取: ' + cachedData.fileName, 'info');
            }
          } else {
            await uploadFile(file, fileHash);
          }
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker)
      );
    }

    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function () {
      const files = Array.from(fileInput.files || []);
      fileInput.value = '';
      if (files.length > 0) handleFiles(files);
    });

    const uploadArea = document.getElementById('uploadArea');
    const card = document.querySelector('.card');

    ['dragenter', 'dragover'].forEach(function (evt) {
      card.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(function (evt) {
      card.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (evt === 'dragleave' && e.relatedTarget && card.contains(e.relatedTarget)) return;
        uploadArea.classList.remove('dragover');
      });
    });

    card.addEventListener('drop', function (e) {
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length > 0) handleFiles(Array.from(files));
    });

    document.addEventListener('paste', function (event) {
      const clipboardData = event.clipboardData;
      if (!clipboardData || !clipboardData.items) return;
      const files = [];
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        event.preventDefault();
        handleFiles(files);
      }
    });

    document.querySelectorAll('#formatButtons .btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const format = btn.dataset.format;
        const urls = originalImageURLs.map(function (u) { return u.trim(); }).filter(function (u) { return u; });
        if (urls.length === 0) return;
        const formatted = formatLinks(urls, format);
        document.getElementById('fileLink').value = formatted;
        adjustTextareaHeight(document.getElementById('fileLink'));
        copyToClipboard(formatted);
      });
    });

    document.getElementById('viewCacheBtn').addEventListener('click', function () {
      const cacheContent = document.getElementById('cacheContent');
      if (isCacheVisible) {
        cacheContent.hidden = true;
        document.getElementById('fileLink').value = '';
        hideButtonsAndTextarea();
        isCacheVisible = false;
      } else {
        renderCacheContent();
        cacheContent.hidden = false;
        isCacheVisible = true;
      }
    });

    function renderCacheContent() {
      const cacheContent = document.getElementById('cacheContent');
      cacheContent.innerHTML = '';
      if (uploadCache.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'cache-empty';
        empty.textContent = '还没有记录哦！';
        cacheContent.appendChild(empty);
        return;
      }
      const reversed = uploadCache.slice().reverse();
      reversed.forEach(function (item) {
        const div = document.createElement('div');
        div.className = 'cache-item';
        div.textContent = item.timestamp + ' - ' + item.fileName;
        div.addEventListener('click', function () {
          originalImageURLs = [item.url];
          document.getElementById('fileLink').value = item.url;
          document.getElementById('formatButtons').hidden = false;
          document.getElementById('linkGroup').hidden = false;
          adjustTextareaHeight(document.getElementById('fileLink'));
        });
        cacheContent.appendChild(div);
      });
    }

    refreshCompressionBtn();
    setBackgroundImages();
  })();
  </script>
</body>
</html>
  `, 'text/html;charset=UTF-8', CACHE_CONFIG.HTML);

  await cache.put(cacheKey, response.clone());
  return response;
}

async function handleAdminRequest(request, config) {
  if (!authenticate(request, config.username, config.password)) {
    return unauthorizedResponse();
  }
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  return await generateAdminPage(config.database, page);
}

async function generateAdminPage(DATABASE, page = 1) {
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const totalCount = await DATABASE.prepare('SELECT COUNT(*) as count FROM media').first();
  const totalPages = Math.ceil(totalCount.count / pageSize);
  const mediaData = await fetchMediaData(DATABASE, pageSize, offset);

  const mediaHtml = mediaData.map(({ url }) => {
    const fileExtension = getFileExtension(url);
    const fileName = url.split('/').pop();
    const dotIdx = fileName.lastIndexOf('.');
    const baseName = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
    const timestamp = parseInt(baseName, 10);
    const timeText = Number.isFinite(timestamp) && timestamp > 0
      ? new Date(timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      : '未知';
    const mediaType = escapeHtml(fileExtension);
    const escapedUrl = escapeHtml(url);
    const supportedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];
    const supportedVideoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
    const isImage = supportedImageExtensions.includes(fileExtension);
    const isVideo = supportedVideoExtensions.includes(fileExtension);
    const isSupported = isImage || isVideo;
    const backgroundStyle = isSupported ? '' : `style="font-size: 50px; display: flex; justify-content: center; align-items: center;"`;
    const icon = isSupported ? '' : '📁';
    return `
    <div class="media-container" data-key="${escapedUrl}" onclick="toggleImageSelection(this)" ${backgroundStyle}>
      <div class="skeleton"></div>
      <div class="media-type">${mediaType}</div>
      ${isVideo ? `
        <video class="gallery-video" preload="none" controls>
          <source data-src="${escapedUrl}" type="video/${escapeHtml(fileExtension)}">
          您的浏览器不支持视频标签。
        </video>
      ` : `
        ${isImage ? `<img class="gallery-image lazy" data-src="${escapedUrl}" alt="Image">` : icon}
      `}
      <div class="upload-time">上传时间: ${escapeHtml(timeText)}</div>
    </div>
    `;
  }).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>图库</title>
    <link rel="icon" href="https://p1.meituan.net/csc/c195ee91001e783f39f41ffffbbcbd484286.ico" type="image/x-icon">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%); min-height: 100vh; margin: 0; padding: 20px; }
      .page-title { font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center; margin-bottom: 20px; letter-spacing: 0.5px; }
      .header { position: sticky; top: 10px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 1000; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px 20px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.6); flex-wrap: wrap; }
      .header-left { flex: 1; display: flex; gap: 15px; align-items: center; color: #555; font-weight: 500; }
      .header-right { display: flex; gap: 10px; justify-content: flex-end; flex: 1; flex-wrap: wrap; }
      .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
      .media-container { position: relative; overflow: hidden; border-radius: 16px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); border: 1px solid rgba(255, 255, 255, 0.6); aspect-ratio: 1 / 1; transition: all 0.3s ease; cursor: pointer; }
      .media-container:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2); border-color: rgba(102, 126, 234, 0.3); }
      .media-container.selected { border: 2px solid #667eea; background: rgba(102, 126, 234, 0.1); box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
      .media-type { position: absolute; top: 10px; left: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; z-index: 10; text-transform: uppercase; letter-spacing: 0.5px; }
      .upload-time { position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px); padding: 8px 10px; border-radius: 8px; color: #555; font-size: 12px; z-index: 10; display: none; }
      .gallery-image, .gallery-video { width: 100%; height: 100%; object-fit: contain; transition: opacity 0.4s ease; opacity: 0; }
      .gallery-image.loaded, .gallery-video.loaded { opacity: 1; }
      .skeleton { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 16px; }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .skeleton.hidden { display: none; }
      .footer { margin-top: 30px; text-align: center; font-size: 16px; color: #999; padding: 20px; background: rgba(255, 255, 255, 0.6); border-radius: 12px; backdrop-filter: blur(8px); }
      .delete-button, .copy-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; transition: all 0.3s ease; width: auto; font-weight: 500; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
      .delete-button:hover, .copy-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
      .delete-button:active, .copy-button:active { transform: translateY(0); }
      .hidden { display: none; }
      .dropdown { position: relative; display: inline-block; }
      .dropdown-content { display: none; position: absolute; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); min-width: 140px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); z-index: 1001; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.6); overflow: hidden; right: 0; }
      .dropdown-content button { color: #333; padding: 12px 16px; text-decoration: none; display: block; background: none; border: none; width: 100%; text-align: left; font-size: 14px; transition: all 0.2s ease; cursor: pointer; }
      .dropdown-content button:hover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); color: #667eea; }
      .dropdown:hover .dropdown-content { display: block; }
      .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 25px 0; flex-wrap: wrap; padding: 15px; background: rgba(255, 255, 255, 0.6); border-radius: 16px; backdrop-filter: blur(8px); }
      .pagination button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; padding: 10px 24px; cursor: pointer; transition: all 0.3s ease; font-weight: 500; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
      .pagination button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
      .pagination button:disabled { background: linear-gradient(135deg, #ccc 0%, #aaa 100%); cursor: not-allowed; box-shadow: none; }
      .pagination .page-info { color: #555; font-weight: 500; padding: 0 15px; }
      .empty-state { text-align: center; padding: 80px 20px; color: #999; font-size: 18px; background: rgba(255, 255, 255, 0.6); border-radius: 16px; backdrop-filter: blur(8px); }
      .empty-state i { font-size: 72px; margin-bottom: 20px; display: block; opacity: 0.4; }
      @media (max-width: 768px) {
        body { padding: 15px; }
        .page-title { font-size: 24px; margin-bottom: 15px; }
        .header { top: 5px; padding: 12px 15px; border-radius: 12px; }
        .header-left, .header-right { flex: 1 1 100%; justify-content: flex-start; }
        .header-left { font-size: 14px; }
        .header-right { margin-top: 10px; }
        .gallery { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .media-container { border-radius: 12px; }
        .delete-button, .copy-button { padding: 8px 16px; font-size: 14px; min-height: 44px; border-radius: 8px; }
        .pagination { padding: 12px; border-radius: 12px; }
        .pagination button { padding: 8px 16px; font-size: 14px; }
        .pagination .page-info { font-size: 14px; }
      }
    </style>
    <script>
    let selectedCount = 0;
    const selectedKeys = new Set();
    let isAllSelected = false;

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
      document.getElementById('selected-count').textContent = selectedCount;
      const headerRight = document.querySelector('.header-right');
      headerRight.classList.toggle('hidden', selectedCount === 0);
    }

    async function deleteSelectedImages() {
      if (selectedKeys.size === 0) return;
      if (!confirm('你确定要删除选中的媒体文件吗？此操作无法撤回。')) return;

      const keysToDelete = Array.from(selectedKeys);
      try {
        const response = await fetch('/delete-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(keysToDelete)
        });

        if (!response.ok) {
          let msg = '删除失败';
          try { const j = await response.json(); msg = j.error || j.message || msg; } catch {}
          alert(msg);
          return;
        }

        const containers = document.querySelectorAll('.media-container');
        const containersToRemove = [];
        containers.forEach(container => {
          const key = container.getAttribute('data-key');
          if (selectedKeys.has(key)) {
            containersToRemove.push(container);
            container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            container.style.opacity = '0';
            container.style.transform = 'scale(0.8)';
          }
        });

        setTimeout(() => {
          containersToRemove.forEach(c => c.remove());

          const totalCountElement = document.querySelector('.header-left span:first-child');
          const currentTotal = parseInt(totalCountElement.textContent.match(/\\d+/)[0]);
          const newTotal = Math.max(0, currentTotal - keysToDelete.length);
          totalCountElement.textContent = '媒体文件 ' + newTotal + ' 个';

          const pageInfo = document.querySelector('.page-info');
          if (pageInfo) {
            pageInfo.textContent = pageInfo.textContent.replace(/共 \\d+ 个/, '共 ' + newTotal + ' 个');
          }

          selectedKeys.clear();
          selectedCount = 0;
          isAllSelected = false;
          updateDeleteButton();

          if (containersToRemove.length === document.querySelectorAll('.media-container').length) {
            window.location.reload();
          } else {
            alert('选中的媒体已删除');
          }
        }, 300);
      } catch (err) {
        alert('删除失败: ' + err.message);
      }
    }

    function copyFormattedLinks(format) {
      const urls = Array.from(selectedKeys).map(url => url.trim()).filter(url => url !== '');
      const formattedLinks = formatLinks(urls, format);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formattedLinks)
          .then(() => alert('复制成功'))
          .catch(() => alert('复制失败'));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formattedLinks;
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); alert('复制成功'); }
        catch { alert('复制失败'); }
        document.body.removeChild(textarea);
      }
    }

    function formatLinks(urls, format) {
      switch (format) {
        case 'url': return urls.join('\\n\\n');
        case 'bbcode': return urls.map(url => '[img]' + url + '[/img]').join('\\n\\n');
        case 'markdown': return urls.map(url => '![image](' + url + ')').join('\\n\\n');
        default: return urls.join('\\n');
      }
    }

    function selectAllImages() {
      const mediaContainers = Array.from(document.querySelectorAll('.media-container'));
      const batchSize = 20;
      let index = 0;

      function processBatch() {
        const end = Math.min(index + batchSize, mediaContainers.length);
        for (let i = index; i < end; i++) {
          const container = mediaContainers[i];
          if (isAllSelected) {
            container.classList.remove('selected');
            selectedKeys.delete(container.getAttribute('data-key'));
            container.querySelector('.upload-time').style.display = 'none';
          } else if (!container.classList.contains('selected')) {
            container.classList.add('selected');
            selectedKeys.add(container.getAttribute('data-key'));
            container.querySelector('.upload-time').style.display = 'block';
          }
        }
        index = end;
        if (index < mediaContainers.length) {
          requestAnimationFrame(processBatch);
        } else {
          selectedCount = isAllSelected ? 0 : selectedKeys.size;
          isAllSelected = !isAllSelected;
          updateDeleteButton();
        }
      }
      requestAnimationFrame(processBatch);
    }

    document.addEventListener('DOMContentLoaded', () => {
      const mediaContainers = document.querySelectorAll('.media-container[data-key]');
      const options = { root: null, rootMargin: '100px', threshold: 0.01 };

      const mediaObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const container = entry.target;
            const skeleton = container.querySelector('.skeleton');
            const video = container.querySelector('video');
            if (video) {
              const source = video.querySelector('source');
              if (source && source.dataset.src) {
                video.src = source.dataset.src;
                video.load();
                video.onloadeddata = () => { video.classList.add('loaded'); if (skeleton) skeleton.classList.add('hidden'); };
              }
            } else {
              const img = container.querySelector('img');
              if (img && img.dataset.src && !img.src) {
                img.src = img.dataset.src;
                img.onload = () => { img.classList.add('loaded'); if (skeleton) skeleton.classList.add('hidden'); };
                img.onerror = () => { if (skeleton) skeleton.classList.add('hidden'); };
              } else if (!img) {
                if (skeleton) skeleton.classList.add('hidden');
              }
            }
            observer.unobserve(container);
          }
        });
      }, options);

      mediaContainers.forEach(container => mediaObserver.observe(container));
    });
  </script>
  </head>
  <body>
    <h1 class="page-title">图库管理</h1>
    <div class="header">
      <div class="header-left">
        <span>媒体文件 ${totalCount.count} 个</span>
        <span>已选中: <span id="selected-count">0</span>个</span>
      </div>
      <div class="header-right hidden">
        <div class="dropdown">
          <button class="copy-button">复制</button>
          <div class="dropdown-content">
            <button onclick="copyFormattedLinks('url')">URL</button>
            <button onclick="copyFormattedLinks('bbcode')">BBCode</button>
            <button onclick="copyFormattedLinks('markdown')">Markdown</button>
          </div>
        </div>
        <button id="select-all-button" class="delete-button" onclick="selectAllImages()">全选</button>
        <button id="delete-button" class="delete-button" onclick="deleteSelectedImages()">删除</button>
      </div>
    </div>
    <div class="gallery">
      ${mediaData.length === 0 ? '<div class="empty-state"><i>📁</i><div>暂无媒体文件</div></div>' : mediaHtml}
    </div>
    ${mediaData.length > 0 ? `
    <div class="pagination">
      <button onclick="goToPage(${page - 1})" ${page <= 1 ? 'disabled' : ''}>上一页</button>
      <span class="page-info">第 ${page} / ${totalPages} 页 (共 ${totalCount.count} 个)</span>
      <button onclick="goToPage(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>下一页</button>
    </div>
    ` : ''}
    <div class="footer">到底啦</div>
    <script>
      function goToPage(pageNum) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', pageNum);
        window.location.href = url.toString();
      }
    </script>
  </body>
  </html>
  `;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function fetchMediaData(DATABASE, limit = null, offset = 0) {
  let query = 'SELECT url FROM media ORDER BY url DESC';
  if (limit !== null) query += ` LIMIT ${limit} OFFSET ${offset}`;
  const result = await DATABASE.prepare(query).all();
  return result.results.map(row => ({ url: row.url }));
}

async function handleUploadRequest(request, config) {
  if (config.enableAuth && !authenticate(request, config.username, config.password)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') throw new Error('缺少文件');

    if (file.size > config.maxSize) {
      return jsonResponse({ error: `文件大小超过${config.maxSize / (1024 * 1024)}MB限制` }, 413);
    }

    const originalName = file.name || '';
    const dotIndex = originalName.lastIndexOf('.');
    const ext = dotIndex > 0 ? originalName.slice(dotIndex + 1).toLowerCase() : '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return jsonResponse({ error: '不支持的文件类型: ' + (ext || '未知') }, 415);
    }

    const uploadFormData = new FormData();
    uploadFormData.append('chat_id', config.tgChatId);
    if (file.type.startsWith('image/gif')) {
      const newFileName = file.name.replace(/\.gif$/i, '.jpeg');
      const newFile = new File([file], newFileName, { type: 'image/jpeg' });
      uploadFormData.append('document', newFile);
    } else {
      uploadFormData.append('document', file);
    }

    let telegramResponse;
    try {
      telegramResponse = await fetch(
        `https://api.telegram.org/bot${config.tgBotToken}/sendDocument`,
        { method: 'POST', body: uploadFormData }
      );
    } catch (e) {
      throw new Error('无法连接 Telegram: ' + e.message);
    }

    if (!telegramResponse.ok) {
      let errDesc = '上传到 Telegram 失败';
      try {
        const errData = await telegramResponse.json();
        if (errData && errData.description) errDesc = errData.description;
      } catch {}
      throw new Error(errDesc);
    }

    const responseData = await telegramResponse.json();
    const fileId = responseData.result?.video?.file_id
      || responseData.result?.document?.file_id
      || responseData.result?.sticker?.file_id;
    if (!fileId) throw new Error('返回的数据中没有文件 ID');

    const timestamp = Date.now();
    const r2Key = `${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
    const imageURL = `https://${config.domain}/${r2Key}.${ext}`;

    await config.database.prepare(
      'INSERT INTO media (url, fileId) VALUES (?, ?) ON CONFLICT(url) DO NOTHING'
    ).bind(imageURL, fileId).run();

    return jsonResponse({ data: imageURL });
  } catch (error) {
    console.error('上传失败:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

async function handleImageRequest(request, config) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const ext = getFileExtension(pathname);

  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}${pathname}`);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const requestedUrl = `${url.origin}${pathname}`;
  const result = await config.database.prepare(
    'SELECT fileId FROM media WHERE url = ?'
  ).bind(requestedUrl).first();

  if (!result) {
    return new Response('资源不存在', { status: 404 });
  }

  const fileId = result.fileId;
  let filePath = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(200 * attempt);

    try {
      const getFilePath = await fetch(
        `https://api.telegram.org/bot${config.tgBotToken}/getFile?file_id=${encodeURIComponent(fileId)}`
      );
      if (!getFilePath.ok) continue;

      const fileData = await getFilePath.json();
      if (fileData.ok && fileData.result && fileData.result.file_path) {
        filePath = fileData.result.file_path;
        break;
      }
    } catch (e) {
      console.warn('getFile 请求失败:', e.message);
    }
  }

  if (!filePath) {
    return new Response('未找到 FilePath', { status: 404 });
  }

  const getFileResponse = `https://api.telegram.org/file/bot${config.tgBotToken}/${filePath}`;
  const response = await fetch(getFileResponse);
  if (!response.ok) {
    return new Response('获取文件内容失败', { status: 502 });
  }

  const contentType = getContentType(ext);
  const headers = new Headers(response.headers);
  headers.set('Content-Type', contentType);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.IMAGE}, immutable`);
  headers.set('CDN-Cache-Control', `public, max-age=${CACHE_CONFIG.IMAGE}`);

  if (ext === 'svg') {
    headers.set('Content-Disposition', 'attachment');
    headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data:");
  } else {
    headers.set('Content-Disposition', 'inline');
  }

  const responseToCache = new Response(response.body, {
    status: 200,
    headers
  });
  await cache.put(cacheKey, responseToCache.clone());
  return responseToCache;
}

async function handleBingImagesRequest() {
  const cache = caches.default;
  const cacheKey = new Request('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=5');
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const res = await fetch(cacheKey);
  if (!res.ok) {
    return new Response('请求 Bing API 失败', { status: res.status });
  }

  const bingData = await res.json();
  const images = bingData.images.map(image => ({
    url: `https://cn.bing.com${image.url}`
  }));

  const response = createCachedResponse(
    JSON.stringify({ status: true, message: '操作成功', data: images }),
    'application/json',
    CACHE_CONFIG.API
  );
  await cache.put(cacheKey, response.clone());
  return response;
}

async function handleDeleteImagesRequest(request, config) {
  if (!authenticate(request, config.username, config.password)) {
    return unauthorizedResponse();
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const keysToDelete = await request.json();
    if (!Array.isArray(keysToDelete) || keysToDelete.length === 0) {
      return jsonResponse({ message: '没有要删除的项' }, 400);
    }

    const expectedPrefix = `https://${config.domain}/`;
    const invalid = keysToDelete.find(u => typeof u !== 'string' || !u.startsWith(expectedPrefix));
    if (invalid) {
      return jsonResponse({ error: '非法的 URL: ' + invalid }, 400);
    }

    const placeholders = keysToDelete.map(() => '?').join(',');
    const cache = caches.default;

    const [dbResult] = await Promise.all([
      config.database
        .prepare(`DELETE FROM media WHERE url IN (${placeholders})`)
        .bind(...keysToDelete)
        .run(),
      Promise.all(keysToDelete.map(async (url) => {
        await cache.delete(new Request(url));
      }))
    ]);

    if (dbResult.changes === 0) {
      return jsonResponse({ message: '未找到要删除的项' }, 404);
    }

    return jsonResponse({ message: '删除成功' });
  } catch (error) {
    console.error('删除失败:', error);
    return jsonResponse({ error: '删除失败', details: error.message }, 500);
  }
}
