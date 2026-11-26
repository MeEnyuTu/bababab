const http = require('http');
const fs = require('fs');
const path = require('path');

// 优先使用环境变量里的端口（比如 Render），否则用 3000
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // 1. 健康检查接口（Render / 监控用）
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('OK');
  }

  // 2. 解析路径
  // 如果访问根路径 '/'，默认返回 index.html
  let requestUrl = req.url.split('?')[0]; // 忽略查询参数
  if (requestUrl === '/') requestUrl = '/index.html';

  // 3. 安全防御：防止路径穿越攻击 (如 /../../etc/passwd)
  const safePath = path.normalize(requestUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  // 4. 获取文件后缀名，确定 MIME 类型
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // 5. 读取文件并返回
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // 如果找不到文件，返回 404
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        // 其他服务器错误，返回 500
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
    } else {
      // 成功返回文件
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=============================================`);
  console.log(`🚀 服务器已启动！`);
  console.log(`🌐 本地访问地址: http://localhost:${PORT}`);
  console.log(`🩺 健康检查接口: http://localhost:${PORT}/api/health`);
  console.log(`=============================================\n`);
});
