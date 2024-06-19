const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 3500

app.get('^/$|/index(.html)?', (req, res) => {
    // res.sendFile('./views/index.html', {root : __dirname }) or
    res.sendFile(path.join(__dirname, 'views', 'index.html'))

} ) 

app.get('/new-page(.html)?', (req, res) => {
    // res.sendFile('./views/index.html', {root : __dirname }) or
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'))
}) 

app.get('/old-page(.html)?', (req, res) => {
    res.redirect(301, '/new-page.html') // 302 bu default
}) 
app.get('/hello(.html)?', (req, res, next) => {
    console.log('attempt to load hello.html');
    next()
},(req, res) => {
      res.send('hello >World')  
})

app.get('/*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
}) 

app.listen(PORT, () => console.log('server runnin on port ' + PORT))
