const url = require('url');

// 直接使用 require 导入 JSON 文件。
// 确保这两个文件 (rank.json 和 Passport.json) 位于 api/ 目录下
const rankings = require('./rank.json');
const policies = require('./Passport.json');

// 这是 Vercel Serverless Function 的标准写法 (使用 module.exports)
module.exports = (req, res) => {
  // 解析请求的 URL，获取路径和查询参数
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  // 设置 CORS 响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求 (CORS 预检)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- API 路由逻辑 ---

  // 1. 处理排行榜请求 (/api/rankings)
  if (pathname.includes('/rankings')) {
    // 护照排行数据
    return res.status(200).json(rankings);
  }
  
  // 2. 处理搜索请求 (/api/search?term=...)
  if (pathname.includes('/search')) {
    const searchTerm = (parsedUrl.query.term || '').toLowerCase().trim();
    
    if (!searchTerm) {
      return res.status(200).json([]);
    }

    const results = [];
    const maxResults = 10;
    
    // 遍历 JSON 数据进行搜索
    for (const item of policies) {
        if (results.length >= maxResults) break;
        
        const chn = (item.chn || '').toLowerCase();
        const eng = (item.eng || '').toLowerCase();
        
        // **简化搜索逻辑：仅匹配中文或英文，排除拼音库依赖**
        if (
            chn.includes(searchTerm) ||
            eng.includes(searchTerm)
        ) {
            results.push(item);
        }
    }

    // 如果启用了 pinyin 库，请取消注释以下代码进行更全面的搜索
    /* const pinyin = require('pinyin'); // 需要重新引入 pinyin 库
    // 重新遍历，这次使用拼音逻辑
    for (const item of policies) {
        if (results.length >= maxResults) break;
        
        const { full: pinyinFull, initials: pinyinInitials } = getPinyin(item.chn);

        if (
            pinyinFull.includes(searchTerm) ||
            pinyinInitials.includes(searchTerm)
        ) {
            // 确保不重复添加
            if (!results.some(r => r.eng === item.eng)) {
                results.push(item);
            }
        }
    }
    */
    
    return res.status(200).json(results);
  }

  // 如果请求的 API 路径没有匹配，返回 404 错误
  res.status(404).json({ error: 'API route not found. Try /api/rankings or /api/search?term=...' });
};
