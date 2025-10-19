const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// 导入JSON数据
// require.resolve 会返回文件的绝对路径，确保在 Vercel 环境下能正确找到文件
const rankings = require(path.resolve(__dirname, 'rank.json'));
const policies = require(path.resolve(__dirname, 'passport.json'));

// 使用 CORS 中间件，允许前端跨域请求
app.use(cors());

// --- API 路由 ---

// 1. 获取排行榜数据的路由
app.get('/api/rankings', (req, res) => {
  res.json(rankings);
});

// 2. 搜索签证政策的路由
app.get('/search', (req, res) => {
  const searchTerm = (req.query.term || '').toLowerCase().trim();
  
  if (!searchTerm) {
    return res.json([]);
  }

  const results = policies.filter(item => {
    const chn = item.chn.toLowerCase();
    const eng = item.eng.toLowerCase();
    // 假设您可能有一个拼音首字母的字段
    const pinyin = (item.pinyin || '').toLowerCase(); 

    return chn.includes(searchTerm) || eng.includes(searchTerm) || pinyin.startsWith(searchTerm);
  });

  res.json(results);
});

// 导出 app 供 Vercel 使用
module.exports = app;
