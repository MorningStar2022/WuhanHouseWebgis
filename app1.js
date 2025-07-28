// 引入所需模块
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
// 创建Express应用
const app = express();
// app.set('view engine', 'ejs');
// 设置模板引擎
app.use(express.static('public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));

var ejs = require('ejs');  //引入的ejs插件
app.engine('html', ejs.__express);
app.set('view engine', 'html');
// 设置 bodyParser 解析请求体
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 设置 session
app.use(session({
  secret: 'secret-key-098', // 用于签署 sessionID 的密钥，可以自行修改
  resave: true,
  saveUninitialized: true
}));
// 创建MySQL连接池
const pool = mysql.createPool({
    host:"localhost", 
    port:"3306", 
    user:"root", 
    password:"tang20020504", 
    database:"test"
});

// 定义路由
app.get('/houses', (req, res) => {
  // 查询数据库中的房源数据
  pool.query('SELECT * FROM houselist', (error, results) => {
    if (error) {
      console.error('Failed to fetch data:', error);
      res.status(500).send('Internal Server Error');
    } else {
      // 渲染house.html模板，并传递查询结果作为参数
      res.render('house', { houses: results });
    }
  });
});
app.get('/', (req, res) => {
    res.redirect('/houses');
  });

  app.post('/houses', (req, res) => {
    // 获取筛选条件
    const { community, priceMin, priceMax, layout, area } = req.body;
  
    // 构造查询语句
    let query = 'SELECT * FROM houselist WHERE 1=1';
  
    if (community) {
      query += ` AND 小区名 LIKE '%${community}%'`;
    }
  
    if (priceMin) {
      query += ` AND 价格 >= ${priceMin}`;
    }
  
    if (priceMax) {
      query += ` AND 价格 <= ${priceMax}`;
    }
  
    if (layout) {
      query += ` AND 户型 LIKE '%${layout}%'`;
    }
  
    if (area) {
      query += ` AND 面积 LIKE '%${area}%'`;
    }
  
    // 执行查询
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  });
  
  app.post('/upload', (req, res) => {
    const houseData = req.body;
  
    // 将房源数据插入到数据库中的houselist表中
    pool.query('INSERT INTO houselist SET ?', houseData, (error, results) => {
      if (error) {
        console.error('上传房源失败:', error);
        res.status(500).json({ message: '上传房源失败' });
      } else {
        console.log('上传房源成功:', results);
        res.json({ message: '上传房源成功' });
      }
    });
  });
// 启动服务器
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
