const createNextInSeq = require.main.require('./selectors/createNextInSeq');

module.exports = counterCollection => (
  counterCollection.findOne({
    _id: 'urls',
  }).then(counter => (
    counterCollection.updateOne({
      _id: 'urls',
    }, {
      $set: { lastShortened: createNextInSeq(counter.lastShortened) },
    }).then(
      () => createNextInSeq(counter.lastShortened)
    ).catch((err) => {
      throw err;
    })
  )).then(
    shortenedUrl => shortenedUrl
  ).catch((err) => {
    throw err;
  })
);

