const express = require('express');
const { isWebUri } = require('valid-url');
const mongodb = require('mongodb');

const app = express();
const mongo = mongodb.MongoClient;
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/urls';
const getNextShortened = require.main.require('./selectors/getShortenedUrl');

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

app.get(/^\/create\/(.+)/, (req, res) => {
  const newUrl = /^https?:\/\//.test(req.params[0])
    ? req.params[0]
    : `http://${req.params[0]}`;

  mongo.connect(mongoUrl, (err, db) => {
    if (err) {
      res.send('Unable to connect to the mongoDB server. Error:', err);
    } else if (!isWebUri(newUrl)) {
      res.send('Url is invalid');
    } else {
      const urlsCollection = db.collection('urls');

      urlsCollection.findOne({ url: newUrl }).then((doc) => {
        if (doc) {
          const fullShortened = `${req.protocol}://${req.get('host')}/go/${doc.shortened}`;

          res.send(`
            Original url is <a href="${newUrl}">${newUrl}</a><br />
            Shortened url is <a href="${fullShortened}">${fullShortened}</a>
          `);
          db.close();
        } else {
          getNextShortened(db.collection('counter')).then((shortened) => {
            urlsCollection.insert({
              url: newUrl,
              shortened,
            }).then(() => {
              const fullShortened = `${req.protocol}://${req.get('host')}/go/${shortened}`;

              res.send(`
                Original url is <a href="${newUrl}">${newUrl}</a><br />
                Shortened url is <a href="${fullShortened}">${fullShortened}</a>
              `);
              db.close();
            }).catch((error) => {
              throw error;
            });
          }).catch((error) => {
            throw error;
          });
        }
      }).catch((error) => {
        console.log(error);
        res.send('Something went wrong');
        db.close();
      });
    }
  });
});

app.get('/go/:shortened', (req, res) => {
  const shortened = req.params.shortened;

  mongo.connect(mongoUrl, (err, db) => {
    if (err) {
      res.send('Unable to connect to the mongoDB server. Error:', err);
    } else {
      const urlsCollection = db.collection('urls');
      urlsCollection.findOne({
        shortened,
      }).then((doc) => {
        res.redirect(doc.url);
        db.close();
      }).catch(() => {
        res.send('Can\'t find url :(');
        db.close();
      });
    }
  });
});

app.all('*', (req, res) => {
  res.redirect(`${req.protocol}://${req.get('host')}`);
});

app.listen(process.env.PORT || 3001);
