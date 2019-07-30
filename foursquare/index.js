var
    async = require("async"),
    moment = require('moment'),
    util = require('util'),
    nodeFoursquare = require('node-foursquare'),
    logger = require('winston'),
    ics = require('ics'),
    {writeFileSync } = require('fs')




const config = {
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


function getEpoch(date) {
  return Math.round(date.getTime() / 1000);
}

async function retrieveCheckinSet(offset, options, accessToken, callback) {
  logger.debug("ENTERING: retrieveCheckinSet, offset=" + offset);

  var params = {
    "limit" : options.limit,
    "offset" : offset
  };

  if (options.before)
    params.beforeTimestamp = getEpoch(options.before);
  if (options.after)
    params.afterTimestamp = getEpoch(options.after);

  Foursquare.Users.getSelfCheckins(params, accessToken, function success(error, results) {
    if(error) {
      callback(error);
    }
    else {
      callback(null, results.checkins ? results.checkins.items || [] : []);
    }
  });
}

async function retrieveCheckins(options, accessToken, callback) {
  logger.debug("ENTERING: getCheckins");

  options = options || {};

  var coreOffset = 0,
    queuePass = true,
    passTotal = 0,
    allResults = [];

  async.whilst(
    async function() {
      passTotal++;
      return queuePass;
    },
    function(callback) {
      var passes = [],
        rc = function(callback) {
          retrieveCheckinSet(coreOffset, options, accessToken, callback);
          coreOffset += options.limit;
        };
      // TODO: This looks and feels STUPID. Alternative?
      for(var i = 0; i < options.concurrentCalls; i++) {
        passes.push(rc);
      }

      async.parallel(passes, function(error, checkins) {
        if(!error) {
          checkins.forEach(function(checkinSet) {
            queuePass = (checkinSet.length == options.limit);
            allResults = allResults.concat(checkinSet);
          });
        }
        callback(error, checkins);
      });
    },
    function(error) {
      logger.info("RETRIEVED: " + allResults.length + " checkins in " + passTotal + " pass(es) of " + options.concurrentCalls + " calls each.");
      if(error) {
        logger.error(error);
        callback(error);
      }
      else {
        callback(null, allResults);
      }
    }
  );
}

function validateYear(year){
  switch (year) {
    case 2009:
    case 2010:
    case 2011:
    case 2012:
    case 2013:
    case 2014:
    case 2015:
    case 2016:
    case 2017:
    case 2018:
    case 2019:
    case "all":
    case "current":
      break;
    default:
      throw ValidationError(year + "is not a valid year");
      break;
  }

}

function prepareOptions(year, toYear) {
  var options = {
    concurrentCalls: 6,
    before: 0,
    after: 0,
    limit: 250,
  };

  var y = 0;

  switch (year) {
    case 2009:
    case 2010:
    case 2011:
    case 2012:
    case 2013:
    case 2014:
    case 2015:
    case 2016:
    case 2017:
    case 2018:
    case 2019:
      y = year;
      break;
    case "all":
      break;
    case "current":
    default:
      y = (new Date()).getFullYear();
      break;
  }

  if (!toYear)
    toYear=y

  if (y)
    {
      options.before = new Date(parseInt(toYear),11,31,11,59,59);
      logger.debug("beforeTimestamp: " + options.before + ", epoch: " + getEpoch(options.before));
      options.after =  new Date(parseInt(y),0,1,0,0,0);
      logger.debug("afterTimestamp: " + options.after + ", epoch: " + getEpoch(options.after));
    }

    return options;
}


async function do4SQCheckins(year) {

  var options = prepareOptions(year);

  return new Promise(function(resolve, reject) {

    retrieveCheckins(options, ACCESS_TOKEN, function (error, checkins) {

      if (error) {
        console.error("Error: %s",error);
        reject(error);
      }

      if (checkins) {
        console.log("Data length: %d", checkins.length);

        async.map(checkins,CheckinToEvent, (err,results) => {
          if (err)
            console.error("Error " + util.inspect(err));

          if (results) {
            const { error, calendar } = ics.createEvents(results);
            if (error) {
              console.error("Error " + util.inspect(error))
            }

            //writeFileSync("event.ics", calendar)
            resolve(results);
          }
        });
      }
    });
  })
};


module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {

        let details = await doSelfDetails();

        let checkins = await do4SQCheckins();

        const { error, value } = ics.createEvents(checkins);
        if (error) {
          console.error("Error " + util.inspect(error))
          context.res = {
            status: 400,
            body: error
          }
        }
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello from Azure " + (req.query.name || req.body.name) + "\n" + process.env['FOURSQUARE_ACCESS_TOKEN'] + "\n" +value
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
}