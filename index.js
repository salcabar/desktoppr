var fs = require('fs');
var path = require('path');
var https = require('https');
var request = require('request');
var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');
var log = require('./logHelp').helper;

var url = "https://api.desktoppr.co/1/wallpapers";

getPages(url, 1, 100);

function getPages(url, beginPageId, endPageId) {
    
    var bufferHelper = new BufferHelper();
    var data = null;
    var pageUrl = url + '?page=' + beginPageId;

    log.info('pageUrl------ ' + pageUrl);

    https.get(pageUrl, function(res) {

        res.on('data', function(chunk){

          bufferHelper.concat(chunk);

        });

        res.on('end', function(){

            data = iconv.decode(bufferHelper.toBuffer(),'gb2312');
            
            var obj = JSON.parse(data);
            var dataList = obj.response;
            var length = dataList.length;
            var flag = 0;
            
            dataList.forEach(function(data,i){

                var filename = parseUrlForFileName(data.image.url);
                var imageUrl = data.image.url;

                downloadImg(imageUrl, filename, function() {
                    flag++;
                    log.info('第' + beginPageId + '页' + '----第' + i + '张完成',flag);
                    if(length == flag) {
                        log.warn('第' + beginPageId + '页完成');
                        if(beginPageId == endPageId) return;
                        getPages(url , beginPageId + 1, endPageId);
                    }
                })
            })

          
        });

    }).on('error', function(e) {

    });
}

function parseUrlForFileName(address) {
    var filename = path.basename(address);
    return filename;
}

var downloadImg = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        log.info('content-type:', res.headers['content-type']);  //这里返回图片的类型
        log.info('content-length:', Math.round(res.headers['content-length'] / 1024) + 'KB');  //图片大小
        if (err) {
            log.error('err: '+ err);
            return false;
        }
        request(uri).pipe(fs.createWriteStream('images/'+filename)).on('close', callback);  
    });
};
 

