require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

const dns = require('dns');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

// Create a 'urlEntry' Mongoose Schema */
var urlEntrySchema = new mongoose.Schema({
  url: String,
  shortUrl: String
});

// Create a 'urlEntry' model
var urlEntry = mongoose.model('urlEntry', urlEntrySchema);

var testUrlEntry = new urlEntry({url: "http://google.com", shortUrl: "http://g"});

testUrlEntry.save(function(err, data) {
    if (err) return console.error(err);
    console.log("Test URL Entry: "+data);
    });
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// *** URL SHORTENER MICROSERVICE *****

app.use(express.json()); //For JSON requests
app.use(express.urlencoded({extended: true}));

// Redirect requests that have a short url
app.all('/api/shorturl/*', (req, res) => {
  let path = req.path;
  console.log ("get request: "+path);
  const lastSegment = path.substring(path.lastIndexOf('/') + 1)
  console.log("shorturl to redirect: "+lastSegment);
  urlEntry.findOne({shortUrl: lastSegment}, (err, entry) => {
      if (err) return console.log("findOne error: "+err);
  console.log ("entry :"+entry);
  res.redirect(301, entry.url);
});
});

app.post('/api/shorturl/', (req, res) => {
  var origUrl = req.body.url;
  console.log(`req.body.url: ${origUrl}`);
  console.log("origUrl substring: "+origUrl.substring(0,4));

  // Invalid URL case
  if (origUrl.substring(0,4) !== "http"){
    console.log("invalid url: "+origUrl);
    return res.json({ error: 'invalid url' });
    }

  // Valid URL case
  else {
    console.log("\nhave a valid url\n");
    urlEntry.findOne({url: origUrl}, (err, entry) => {
      if (err) return console.log("findOne error: "+err);

      // If no current entry, create one
      console.log("Result of findOne : "+entry);
      if (entry === null){
        // Use timestamp string as short URL
        date = new Date();
        timestamp = date.getTime();
        shortUrlStr = timestamp.toString();
        console.log(shortUrlStr);

        // Save entry in database
        var newUrl = 
          new urlEntry({url: origUrl, shortUrl: shortUrlStr});
        newUrl.save(function(err, data) {
        if (err) return console.log("save error: "+err);
        console.log("New Entry: "+data);

        // Send response with both urls
        return res.json
          ({original_url: origUrl, short_url: shortUrlStr});
        })
      }
        // Entry already exists in data base so respond with it
      else {
        console.log("Already in database: "+entry);
        return res.json({original_url: entry.url, short_url: entry.shortUrl });
      }
    });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
