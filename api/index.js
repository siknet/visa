const url = require('url');

// require 会自动缓存 JSON 文件，这很高效
const rankings = require('./rank.json');
const policies = require('./Passport.json');

// 这是 Vercel Serverless Function 的标准写法
module.exports = (req, res) => {
  // 解析请求的 URL，获取路径和查询参数
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  // 设置 CORS 响应头，允许任何来源的访问
  // 这对于让你的前端能从 Vercel 的域名访问 API 是必须的
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- API 路由逻辑 ---

  // 1. 处理排行榜请求
  if (pathname === '/api/rankings') {
    return res.status(200).json(rankings);
  }
  
  // 2. 处理搜索请求
  if (pathname === '/search') {
    const searchTerm = (parsedUrl.query.term || '').toLowerCase().trim();
    
    if (!searchTerm) {
      return res.status(200).json([]);
    }

    const results = policies.filter(item => {
      const chn = item.chn.toLowerCase();
      const eng = item.eng.toLowerCase();
      const pinyin = (item.pinyin || '').toLowerCase(); 
      return chn.includes(searchTerm) || eng.includes(searchTerm) || pinyin.startsWith(searchTerm);
    });

    return res.status(200).json(results);
  }

  // 如果请求的 API 路径没有匹配，返回 404 错误
  res.status(404).json({ error: 'API route not found' });
};

