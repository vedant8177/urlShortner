require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
  
});




const urls = [];

app.post('/api/shorturl', (req, res) => {
  let url = new URL(req.body.url);
  console.log(url);
  dns.lookup(url.hostname, (err, address, family) => {
    if (err) {
      res.json({ error: 'invalid url' })
    }
    else {
      if (!urls.includes(url.href)) {
        urls.push(url.href);
      }
      res.json({
        original_url: url,
        short_url: urls.indexOf(url.origin) + 1
      });
    }
  });
});



app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  res.send(id)
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
