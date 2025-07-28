const mysql = require('mysql');
const fs = require('fs');

// 创建数据库连接
const connection = mysql.createConnection({
    host:"localhost", 
    port:"3306", 
    user:"root", 
    password:"tang20020504", 
    database:"test"
});

// 读取房源数据的 JSON 文件
const jsonData = fs.readFileSync('二手房源数据.json');
const housingData = JSON.parse(jsonData);

// 插入数据到数据库表
housingData.features.forEach(feature => {
  const properties = feature.properties;
  const coordinates = feature.geometry.coordinates;

  const sql = `
    INSERT INTO houselist
      (小区名, 区域, 户型, 面积, 朝向, 装修风, 楼层, 房屋类, 价格, 备注, 链接, 经度, 纬度)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    properties['小区名'],
    properties['区域'],
    properties['户型'],
    properties['面积'],
    properties['朝向'],
    properties['装修风'],
    properties['楼层'],
    properties['房屋类'],
    properties['价格'],
    properties['备注'],
    properties['链接'],
    coordinates[0],
    coordinates[1]
  ];

  connection.query(sql, values, (error, results) => {
    if (error) {
        console.error('Failed to insert data:', error);
    } else {
      console.log('Data inserted successfully:', results);
    }
  });
});

// 关闭数据库连接
connection.end();
