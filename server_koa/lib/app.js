'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _config = require('./config');

var _writeRecords = require('./writeRecords');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const port = 7780;

let app = (0, _express2.default)();
let apiRouters = _express2.default.Router();
let Routers = _express2.default.Router();

apiRouters.get('/getWxPlatform', function (req, res) {
  const url = _config.wxUrl + '/searchbiz';
  _axios2.default.get(url, {
    headers: {
      referer: _config.referer + _config.token,
      host: _config.host,
      cookie: (0, _config.returnCookie)()
    },
    params: req.query
  }).then(response => {
    req.query.jsonpCallback = req.query.jsonpCallback || 'wxJsonpCallback';
    (0, _writeRecords.writeInMongo)(url, response.data, () => {
      res.send(req.query.jsonpCallback + '(' + JSON.stringify(response.data) + ')');
    });
  }).catch(e => {
    console.log(e);
  });
});

/**
 * 通过微信公众号返回文章的转发api
 */
apiRouters.get('/getWxNewsList', function (req, res) {
  const url = _config.wxUrl + '/appmsg';
  _axios2.default.get(url, {
    headers: {
      referer: _config.referer + _config.token,
      host: _config.host,
      cookie: (0, _config.returnCookie)()
    },
    params: req.query
  }).then(response => {
    req.query.jsonpCallback = req.query.jsonpCallback || 'wxJsonpCallback';
    res.send(req.query.jsonpCallback + '(' + JSON.stringify(response.data) + ')');
  }).catch(e => {
    console.log(e);
  });
});

app.use('/api', apiRouters);

exports.default = app;


app.listen(port, function () {
  console.log(`app is listening at port ${port}`);
});