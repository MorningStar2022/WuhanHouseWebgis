var map = new AMap.Map("container", {
  resizeEnable: true,
  zoomEnable: true,
  center: [114.298572, 30.584355],
  zoom: 13
});
var loca = new Loca.Container({
  map,
});


var url = "二手房源数据_2.json"
// 加载并解析 GeoJSON 数据
var infoWindow = new AMap.InfoWindow({
  offset: new AMap.Pixel(0, -30)
});
var placeSearch = new AMap.PlaceSearch({

  map: map // 将查询结果展示在地图上
});
// 设置查询参数
//添加标尺
var scale = new AMap.Scale();
map.addControl(scale);
//经度、纬度、时间、通勤方式（默认是地铁+公交）
var arrivalRange = new AMap.ArrivalRange();
var x,
  y,
  t,
  vehicle = 'SUBWAY,BUS';
var radius_0 = 500; // 设置查询的半径（单位：米）
var radius_1 = 1000; // 设置查询的半径（单位：米）
var keyword_1 = '公交站'; // 设置查询的关键词，可以是地铁站、公交站、医院等
var keyword_2 = '地铁站'; // 设置查询的关键词，可以是地铁站、公交站、医院等
var keyword_3 = '医院'; // 设置查询的关键词，可以是地铁站、公交站、医院等
var center;
var workAddress, workMarker;
var polygonArray = [];
//路径规划
var amapTransfer;
var auto = new AMap.AutoComplete({
  //通过id指定输入元素
  input: "worklocation",
});
console.log("检查autocomplete")
console.log()
console.log(auto);
//添加事件监听，在选择补完的地址后调用workLocationSelected
auto.on('select', workLocationSelected);

function searchbus() {
  console.log("bus:" + center)
  placeSearch.searchNearBy(keyword_1, center, radius_0)
}

function searchsubway() {
  console.log("subway:" + center)
  placeSearch.searchNearBy(keyword_2, center, radius_0)
    ;
}

function searchhospital() {
  console.log("hospital:" + center)
  placeSearch.searchNearBy(keyword_3, center, radius_1)
}


function dataload() {
  ajax(url, function (err, geoJSON) {
    if (!err) {
      var geojson = new AMap.GeoJSON({
        geoJSON: geoJSON,
        getMarker: function (geojson, lnglats) {

          // console.log(geojson.properties['价格'])
          marker = new AMap.Marker({
            map: map,
            position: lnglats,
          })
          
          let jingdu = geojson.geometry.coordinates[0]
          let weidu = geojson.geometry.coordinates[1]
          center = []
          console.log("2:" + center)
          center.push(jingdu)
          center.push(weidu)
          console.log("1:" + center)
          content_1 = "<div>" + geojson.properties['区域'] + "——" + geojson.properties['小区名'] + "</div>" + "<div>" + geojson.properties['户型'] + "</div>" + "<div>" + geojson.properties['面积'] + "</div>" + "<div>" + geojson.properties['价格'] + "</div>" + "<div><input type='submit' value='公交站查询' onclick='searchbus()'></div>" + "</div>" + "<div><input type='submit' value='地铁站查询' onclick='searchsubway()'></div>" + "</div>" + "<div><input type='submit' value='医院查询' onclick='searchhospital()'></div>"
          marker.content = content_1
          marker.on('click', function (e) {
            console.log("哈哈：" + e)
            console.log(e)
            center = e.lnglat
            console.log(center)
            e.target.content = e.target.content
            infoWindow.setContent(e.target.content);
            infoWindow.open(map, e.target.getPosition())
            if (amapTransfer) amapTransfer.clear();
            //换乘对象
            amapTransfer = new AMap.Transfer({
              map: map,
              policy: AMap.TransferPolicy.LEAST_TIME,
              city: '武汉市',
              panel: 'transfer-panel',
            });
            console.log("检查以下")
            console.log(workAddress)
            //根据起、终点坐标查询换乘路线
            amapTransfer.search(
              [
                {

                  keyword: workAddress,
                },
                {
                  keyword: geojson.properties['区域'] + geojson.properties['小区名'],
                },
              ],
              function (status, result) { }), function (status, result) {
                console.log("路径规划检查")
                console.log(status)
              }
              ;
          })

        }
      });
      console.log(geojson)
      // map.add(geojson);
      log.success('GeoJSON 数据加载完成')
    } else {
      log.error('GeoJSON 服务请求失败')
    }
  })
}
function workLocationSelected(e) {
  workAddress = e.poi.name;
  loadWorkLocation();
}

function loadWorkMarker(x, y, locationName) {
  workMarker = new AMap.Marker({
    map: map,
    title: locationName,
    icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
    position: [x, y]

  });
}
function loadWorkRange(x, y, t, color, v) {
  arrivalRange.search([x, y], t, function (status, result) {
    if (result.bounds) {
      for (var i = 0; i < result.bounds.length; i++) {
        var polygon = new AMap.Polygon({
          map: map,
          fillColor: color,
          fillOpacity: "0.4",
          strokeColor: color,
          strokeOpacity: "0.8",
          strokeWeight: 1
        });
        polygon.setPath(result.bounds[i]);
        polygonArray.push(polygon);
      }
    }
  }, {
    policy: v
  });
}
function loadWorkLocation() {
  delWorkLocation();
  var geocoder = new AMap.Geocoder({
    city: "武汉",
    radius: 1000
  });

  geocoder.getLocation(workAddress, function (status, result) {
    if (status === "complete" && result.info === 'OK') {
      var geocode = result.geocodes[0];
      x = geocode.location.getLng();
      y = geocode.location.getLat();
      loadWorkMarker(x, y);
      loadWorkRange(x, y, 60, "#3f67a5", vehicle);
      map.setZoomAndCenter(11, [x, y]);
    }
  })
}
function delWorkLocation() {
  if (polygonArray) map.remove(polygonArray);
  if (workMarker) map.remove(workMarker);
  polygonArray = [];
}
