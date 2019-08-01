var
    async = require("async"),
    moment = require('moment'),
    util = require('util'),
    nodeFoursquare = require('node-foursquare'),
    logger = require('winston')
    framework = require('../framework')




var config = {
    'secrets' : {
      'clientId' : process.env.FOURSQUARE_CLIENT_ID,
      'clientSecret' : process.env.FOURSQUARE_CLIENT_SECRET,
      'redirectUrl' : 'http://fondu.com/oauth/authorize'
    },
    winston : {
        all: {
          level: 'trace',
        }
  }
}

const  ACCESS_TOKEN = process.env['FOURSQUARE_ACCESS_TOKEN']

var Foursquare = nodeFoursquare(config);

var user_url;

var event_cnt =0;

async function doSelfDetails() {

  return new Promise( function(resolve, reject) {
    Foursquare.Users.getSelfDetails(ACCESS_TOKEN, function (error, details) {

      if (error)
        reject(error);

      if (details) {
        user_url = details.user.canonicalUrl + "/checkin/";
        resolve(details.user.canonicalUrl + "/checkin/");
      }
    });
  });
};




async function CheckinToEvent(checkin, callback) {
  try {
    var m = moment.unix(checkin.createdAt);
    var t = [m.year(), m.month()+1, m.date(), m.hour(), m.minute()];
    var event = {
        uid : checkin.id,
        start : t,
        end : t,
        title: "<unknown>",
        url: user_url + checkin.id,
        };

        if ("venue" in checkin) {
          if ("name" in checkin["venue"])
            event.title = checkin.venue.name;

          var location = "";
          if ("location" in checkin["venue"]) {
                var loc = checkin["venue"]["location"]
                if ("formattedAddress" in loc && loc["formattedAddress"].length > 0) {
                    location = loc["formattedAddress"].join(", ");
                    //location = util.format("%s, %s", location, address);
                }
          event.location = location;
          event.geo = {lat: checkin.venue.location.lat , lon: checkin.venue.location.lng };
          }
        }

      event.description = event.title + "\r\n" + event.location + "\r\n" + event.url;

    if (callback)
      callback(null, event);

      event_cnt++;
      return event;
    }
    catch (err) {
        console.error(" Error in CheckinToEvent: "+ err);
        console.error(util.inspect(checkin));
        return null;
    }
}

async function retrieveCheckinSet(offset, options, accessToken, callback) {
  logger.debug("ENTERING: retrieveCheckinSet, offset=" + offset);

  var params = {
    "limit" : options.limit,
    "offset" : offset
  };

  if (options.before)
    params.beforeTimestamp = framework.getEpoch(options.before);
  if (options.after)
    params.afterTimestamp = framework.getEpoch(options.after);

  Foursquare.Users.getSelfCheckins(params, accessToken, function success(error, results) {
    if(error) {
      callback(error);
    }
    else {
      callback(null, results.checkins ? results.checkins.items || [] : []);
    }
  });
}

async function get(fromYear, toYear) {
  return framework.generateEvents(fromYear, toYear, retrieveCheckinSet, CheckinToEvent, ACCESS_TOKEN)
};

module.exports = {get, doSelfDetails, config};

