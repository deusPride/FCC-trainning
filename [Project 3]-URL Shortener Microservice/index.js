require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });


const ShortSchema = {
  original_url: String,
  short_url: String
};
const Short = mongoose.model('Short', ShortSchema);

const createAndSaveShort = (url, done) => {
  const short = new Short({ original_url: url, short_url: Math.floor(Math.random() * 1000) });
  short.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findShortByOriginalUrl = (url, done) => {
  Short.findOne({ original_url: url }, (err, shortFound) => {
    if (err) return console.error("Error:", err);
    done(null, shortFound);
  });
};

const findShortByShortUrl = (shortUrl, done) => {
  Short.findOne({ short_url: shortUrl }, (err, shortFound) => {
    if (err) return console.error("Error:", err);
    done(null, shortFound);
  });
};

app.get('/', function (req, res) {
  res.sendFile(`${process.cwd()}/views/index.html`);
});
app.get('/api/test/', function (req, res) {
  res.json({test : 254});
});

app.post('/api/shorturl/', function (req, res) {
  const url = req.body.url;
  const urlWithoutHttps = url.split('/')[2];
  dns.lookup(urlWithoutHttps, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    findShortByOriginalUrl(url, (err, data) => {
      if (err) return console.error(err);
      if (data) {
        return res.json({ original_url: data.original_url, short_url: parseInt(data.short_url) });
      }
      createAndSaveShort(url, (err, data) => {
        if (err) return console.error(err);
        return res.json({ original_url: data.original_url, short_url: parseInt(data.short_url) });
      });
    });
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  const shortUrl = req.params.short_url;
  findShortByShortUrl(shortUrl, (err, data) => {
    if (err) return console.error(err);
    if (data) {
      return res.redirect(data.original_url);
    }
    return res.json({ error: 'No short url found for given input' });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
