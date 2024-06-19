const http = require('http')
const path = require('path')
const fs = require('fs')
const fsPromisses = require('fs').promises
const logEvents =  require('./logEvents')
const EventEmmiter = require('events')
class MyEmmiter extends EventEmmiter {}

const myEmitter = new MyEmmiter()

myEmitter.on('log', (msg , fileName) => logEvents(msg, fileName))
 
const PORT = process.env.PORT || 3500

const servFile =  async (filePath, contentType, response) =>  {
    try {
        const rawData = await fs.promises.readFile(filePath, 
            !contentType.includes('image') ? "utf8" : "")
        const data = contentType === 'Application/json' ? JSON.parse(rawData) : rawData
        response.writeHead(filePath.includes('404.html') ? 404 : 200, {'Content-Type': contentType})
        response.end(contentType = 'application/json' ? JSON.stringify(data)  : data)
    } catch (err) {
        console.log(err);
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt')
        response.statusCode = 500
        response.end()
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt')

    const extension = path.extname(req.url)
    let contentType

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    let filePath =
    contentType === 'text/html' && req.url === '/'
        ? path.join(__dirname, 'views', 'index.html')
        : contentType === 'text/html' && req.url.slice(-1) === '/'
            ? path.join(__dirname, 'views', req.url, 'index.html')
            : contentType === 'text/html'
                ? path.join(__dirname, 'views', req.url)
                : path.join(__dirname, req.url);
    
    // make the .tml extention not required in the broswer
    if (!extension && req.url.slice(-1) !== '/') filePath += '.html'

    const fileExists = fs.existsSync(filePath)

    if (fileExists){
        servFile(filePath,contentType, res)
    }else {
        //404
        //301
        switch(path.parse(filePath).base){
            case 'ok.html':
                res.writeHead(404, {'Location': '/new-page.html'})
                res.end()
                break
            case 'www-page.html':
                res.writeHead(301, {'Location': '/'})
                res.end()
                break
            default: 
            // ser a 404 response
                servFile(path.join(__dirname, 'views', '404.html'),'text/html', res)

        }
    }

})


server.listen(PORT, () => console.log('server runnin on port ' + PORT))



// add listener for the log event

//Emit Event
// myEmitter.emit('log', 'log event emitted')
