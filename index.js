require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
const urls = [];

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url.replace(/\/*$/, '');
  let validUrl = url.replace(/^https:\/\/(www.)?/, '');
  dns.lookup(validUrl, (err, address, family) => {
    if (err) {
      res.json({ error: 'invalid url' })
    }
    else {
      if (!urls.includes(url)) {
        urls.push(url);
      }
      res.json({
        original_url: url,
        short_url: urls.indexOf(url) + 1
      });
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const externarlUrl = urls[req.params.id - 1];
  res.redirect(externarlUrl);
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
