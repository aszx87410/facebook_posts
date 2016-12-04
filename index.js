var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();

var PORT = 5566;
var count = 1;
var msgCount = 0;
var result = [];
var DELAY = 500;

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('index')
})

app.get('/posts', function (req, res) {
  console.log('URL:', req.query.url);
  result = [];
  start(req.query.url);
})

app.listen(PORT, function () {
  console.log('App is running on ' + PORT);
})

function start (url) {
  console.log('page '+ count++, 'msg:', msgCount);
  request(url, function(err, response, body) {
    if(err) {
      return console.log(err);
    } 
    var json = JSON.parse(body);
    if(!json.paging) {
      return over();
    }

    var next = json.paging.next;
    var posts = json.data;
    msgCount+=posts.length;
    for(var i = 0; i<posts.length; i++) {
      if(posts[i].message && posts[i].message.length>=500) {
        result.push({
          message: posts[i].message.substring(0, 100),
          created_time: posts[i].created_time,
          id: posts[i].id
        })
      }
    }

    // over
    setTimeout(function() {
      start(next);
    }, DELAY)
  })
}

function over() {
  // 結束囉
  fs.writeFile("output.json",  JSON.stringify(result, null, 2), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
  });
}