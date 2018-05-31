var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
var qiniu = require('qiniu')

if(!port){
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function(request, response){
    var parsedUrl = url.parse(request.url, true)
    var path = request.url
    var query = ''
    if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
    var pathNoQuery = parsedUrl.pathname
    var queryObject = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('HTTP 路径为\n' + path)
    if(path == '/uptoken'){
	    response.statusCode = 200
        response.setHeader('Content-Type', 'text/json; charset=utf-8')
        response.setHeader('access-control-allow-origin','*')

        // 定义好其中鉴权对象
        var json = fs.readFileSync('./qiniu-config.json')
        config = JSON.parse(json)

        let {accessKey,secretKey} = config;
        // var accessKey = config.accessKey;
        // var secretKey = config.secretKey;
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

        // 上传简单上传的凭证
        var options = {
            scope: '163-music-demo-1',
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(mac);

        response.write(`
        {
        "uptoken":"${uploadToken}"
        }
        `)
        response.end()
    }else {
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        response.setHeader('access-control-allow-origin','*')

        // // response.write(require("./src/admin.html"))
        var pathname = url.parse(request.url).path;
        fs.readFile("./"+pathname.substr(1), function (err, data) {
            if (err) {
                console.log(err);
                // HTTP 状态码: 404 : NOT FOUND
                // Content Type: text/plain
                response.writeHead(404, {'Content-Type': 'text/html'});
            } else {
                // HTTP 状态码: 200 : OK
                // Content Type: text/plain
                response.writeHead(200, {'Content-Type': 'text/html'});

                // 响应文件内容
                response.write(data.toString());
            }
            //  发送响应数据
            response.end();
            // response.end()
        })

    // }else{
    //     response.statusCode = 404
    //     response.end()
    }

    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
