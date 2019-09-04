const 
    moment = require('moment'),
    util = require('util')

module.exports = async function (tweet, callback) {
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
