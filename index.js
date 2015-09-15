var fs = require('fs');
var path = require('path');
var Q = require('q');
var https = require('https');
var request = require('request');
var bufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');

var url = "https://api.desktoppr.co/1/wallpapers";

var bufferHelper = new bufferHelper();

var deferred = Q.defer();

var data = null;


https.get(url, function(res) {

    res.on('data', function(chunk){

      bufferHelper.concat(chunk);

    });

    res.on('end', function(){

        data = iconv.decode(bufferHelper.toBuffer(),'gb2312');
        
        var obj = JSON.parse(data);
        var dataList = obj.response;

        dataList.forEach(function(data,i){
            var filename = parseUrlForFileName(data.image.url);
            var url = data.image.url;
            downloadImg(url, filename, function() {
                console.log(filename + ' done');
            })
        })
      
      deferred.resolve(data);

      
    });

}).on('error', function(e) {

  deferred.reject();

});

function parseUrlForFileName(address) {
    var filename = path.basename(address);
    return filename;
}

var downloadImg = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
    // console.log('content-length:', res.headers['content-length']);  //图片大小
    if (err) {
        console.log('err: '+ err);
        return false;
    }
    console.log('res: '+ res);
    request(uri).pipe(fs.createWriteStream('images/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
    });
};
 

