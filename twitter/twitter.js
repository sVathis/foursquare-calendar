var
    winston = require('winston'),
    framework = require('../framework'),
    fetchTimeline = require('./fetch'),
    TweetToEvent = require('./TweetToEvent')

var config = {
    'secrets' : {
      'clientId' : process.env.FOURSQUARE_CLIENT_ID,
      'clientSecret' : process.env.FOURSQUARE_CLIENT_SECRET,
      'redirectUrl' : 'http://fondu.com/oauth/authorize'
    },
    winston : {
        all: {
          level: 'info'
        }
  }
}

const myparams = {
  screenName:  process.env.TWITTER_SCREEN_NAME,
  count: 200,
  tweet_mode:  process.env.TWITTER_TWEET_MODE
}

const myopts = {
  credentials: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  },
  limit:  process.env.TWITTER_MAX_TWEETS,
}

var twitterlogger = winston.createLogger({
    transports: [
      new winston.transports.Console()]
  });

async function retrieveTweetSet(offset, options, logger, callback) {
  logger.info("ENTERING: retrieveTweetSet, offset=" + offset);

  let all = [];

  const stream = fetchTimeline(myparams, myopts) // => Readable Stream

  stream.on('data', (tweets, index) => {
    all = all.concat(tweets);
  })

  stream.on('error', (error) => {
    logger.error("Error: " + error)
    callback(error);
  })

  stream.on('info', (info) => {
    logger.info("Done");
    callback(null, all);
  })

}

async function get() {
  return framework.generateEvents(null, null, retrieveTweetSet, TweetToEvent, null, twitterlogger)
};

module.exports = {get, config};

