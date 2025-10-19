const url = require('url');

// 导入 pinyin 库。
const pinyin = require('pinyin'); 

// 直接使用 require 导入 JSON 文件。Vercel 在 CJS 模式下会正确处理。
// 确保这两个文件 (rank.json 和 Passport.json) 位于 api/ 目录下
const rankings = require('./rank.json');
const policies = require('./Passport.json');

/**
 * 将中文文本转换为拼音全拼和首字母缩写，用于搜索匹配。
 * @param {string} chn - 中文文本
 * @returns {object} 包含 full 和 initials 属性
 */
function getPinyin(chn) {
  // 获取全拼 (例如: "zhongguo")
  const pinyinFull = pinyin(chn, { style: pinyin.STYLE_NORMAL })
    .flat()
    .join("")
    .toLowerCase();
  
  // 获取首字母 (例如: "zg")
  const pinyinInitials = pinyin(chn, { style: pinyin.STYLE_FIRST_LETTER })
    .flat()
    .join("")
    .toLowerCase();
    
  return { full: pinyinFull, initials: pinyinInitials };
}

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
    // Vercel 推荐在 OPTIONS 请求时结束，防止不必要的函数执行
    return res.status(200).end();
  }

  // --- API 路由逻辑 ---

  // 1. 处理排行榜请求 (/api/rankings)
  if (pathname.includes('/rankings')) {
    console.log('Handling /api/rankings request');
    // 使用 res.status(200).json() 确保返回 JSON 格式
    return res.status(200).json(rankings);
  }
  
  // 2. 处理搜索请求 (/api/search?term=...)
  if (pathname.includes('/search')) {
    console.log('Handling /api/search request');
    const searchTerm = (parsedUrl.query.term || '').toLowerCase().trim();
    
    if (!searchTerm) {
      return res.status(200).json([]);
    }

    const results = [];
    const maxResults = 10;
    
    // 遍历 JSON 数据进行搜索
    for (const item of policies) {
        if (results.length >= maxResults) break;
        
        const chn = item.chn.toLowerCase();
        const eng = item.eng.toLowerCase();
        
        // 生成拼音并进行匹配
        const { full: pinyinFull, initials: pinyinInitials } = getPinyin(item.chn);
        
        // 这里匹配使用 includes，以支持模糊搜索
        if (
            chn.includes(searchTerm) ||
            eng.includes(searchTerm) ||
            pinyinFull.includes(searchTerm) ||
            pinyinInitials.includes(searchTerm)
        ) {
            results.push(item);
        }
    }

    return res.status(200).json(results);
  }

  // 如果请求的 API 路径没有匹配，返回 404 错误
  console.log(`404: API route not found for pathname: ${pathname}`);
  res.status(404).json({ error: 'API route not found. Try /api/rankings or /api/search?term=...' });
};
