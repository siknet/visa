import url from 'url';
import pinyin from 'pinyin';
import { createRequire } from 'module';

// 在 ES Module 中使用 require() 来导入 JSON 文件
// 这是因为 import 导入 JSON 文件需要文件扩展名，并且 Vercel 的兼容性更好
const require = createRequire(import.meta.url);

// 确保这两个文件 (rank.json 和 Passport.json) 位于 api/ 目录下
const rankings = require('./rank.json');
const policies = require('./Passport.json');

/**
 * 将中文文本转换为拼音全拼和首字母缩写，用于搜索匹配。
 * @param {string} chn - 中文文本
 * @returns {object} 包含 full 和 initials 属性
 */
function getPinyin(chn) {
  // ... (getPinyin 函数内容保持不变)
  const pinyinFull = pinyin(chn, { style: pinyin.STYLE_NORMAL })
    .flat()
    .join("")
    .toLowerCase();
  
  const pinyinInitials = pinyin(chn, { style: pinyin.STYLE_FIRST_LETTER })
    .flat()
    .join("")
    .toLowerCase();
    
  return { full: pinyinFull, initials: pinyinInitials };
}

// 这是 Vercel Serverless Function 的标准写法 (使用 export default)
export default (req, res) => {
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
    console.log('Handling /api/rankings request');
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
