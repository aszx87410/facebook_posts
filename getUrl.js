var request = require('request');
var fs = require('fs');

var result = [];
var DELAY = 500;

fs.readFile('output.json', function(err, data) {
  if(err) {
    return console.log(err);
  }
  var json = JSON.parse(data);
  go(json, 0);
})

function done() {
  fs.writeFile("final.json",  JSON.stringify(result, null, 2), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
  });
}

function go (posts, index) {
  if(index>=posts.length) {
    return done();
  }
  var post = posts[index];
  console.log('fetching:', index, post);
  request('https://z-m-graph.facebook.com/v2.8/' + post.id +'?fields=message,permalink_url&access_token=...', 
    function(err, response, body) {
      if(err) {
        return console.log(err);
      } 
      var json = JSON.parse(body);
      result.push(json);
      setTimeout(function() {
        go(posts, index+1);
      }, DELAY);
  })
}