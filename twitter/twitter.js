var
    async = require("async"),
    moment = require('moment'),
    util = require('util'),
    nodeFoursquare = require('node-foursquare'),
    winston = require('winston'),
    framework = require('../framework'),
    fetchTimeline = require('./fetch'),
    fs = require('fs')





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
  limit: 3200,
}

var logger = winston.createLogger({
    transports: [
      new winston.transports.Console()]
  });



async function TweetToEvent(tweet, callback) {
  try {
                                    //Sun Jul 14 14:36:19 +0000 2019
    var m = moment(tweet.created_at,'ddd MMM DD HH:mm:ss ZZ YYYY', 'en');
    var t = [m.year(), m.month()+1, m.date(), m.hour(), m.minute()];
    var event = {
        uid : tweet.id_str,
        start : t,
        end : t,
        title: "<unknown>",
        };

    event.title = tweet.full_text;

    var location = null;
    if (("place" in tweet) && (tweet.place != null)) {
      var place = tweet["place"]["full_name"];
      var country = tweet["place"]["country"];
      location = util.format("%s, %s", place, country)
      event.location = location;
    }

    var geo = null;
    if (("coordinates" in tweet) && (tweet.coordinates != null)) {
      event.geo = {lon: tweet.coordinates.coordinates[0] , lat: tweet.coordinates.coordinates[1] };
    }

    event.url = util.format("https://twitter.com/sVathis/status/%s",tweet.id_str);

    event.description = tweet.full_text + "\r\n" +
                        (location ? location + "\r\n" : "") +
                        (geo  ? geo + "\r\n" : "") +
                        util.format("%d retweets - %d favs\r\n", tweet.retweet_count, tweet.favorite_count) +
                        event.url;

    if (callback)
      callback(null, event);
      return event;
    }
    catch (err) {
        console.error(" Error in TweetToEvent: "+ err);
        console.error(util.inspect(tweet));
        return null;
    }
}

async function retrieveTweetSet(offset, options, callback) {
  logger.info("ENTERING: retrieveTweetSet, offset=" + offset);

  let all = [];

  const stream = fetchTimeline(myparams, myopts) // => Readable Stream

  stream.on('data', (tweets, index) => {
    all = all.concat(tweets);

  })

  stream.on('error', (error) => {
    console.log("error!")
    callback(error);
  })

  stream.on('info', (info) => {
    console.log("Done");

    var str = JSON.stringify(all,null," ");
    fs.writeFile('mytweets.json', str, function (err) {
      if (err) throw err;

    });
    callback(null, all);
  })

}

async function get() {
  return framework.generateEvents(null, null, retrieveTweetSet, TweetToEvent, null)
};

module.exports = {get, config};

