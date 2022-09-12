const http = require('http')
const url = require('url')
const fs = require('fs')
http.createServer(function (req, res) {
   fs.readFile("." + url.parse(req.params, true), (err, data) => {

     if(err) console.log('err')
     console.log('success')
     res.sendStatus(204)
     res.end(data)
   })
}).listen(4000)

