const fs = require('fs'),
      async = require("async"),
      TweetToEvent = require('../twitter/TweetToEvent'),
      ics = require('ics')

function readJson(filename) {
    return fs.readFileSync(`./${filename}`, 'utf8', function (err, data) {
        if (err) throw err;
        return data;
    }).replace(/window.YTD.tweet.part0 = /g, '');
}

function main() {


    var args = process.argv.slice(2);

    var tweets = JSON.parse(readJson(args[0]));

    async.map(tweets, TweetToEvent, (err,events) => {
        if (err) {
          console.error("Error: %s", err);
//          reject(err);
        }

        if (events) {
            const { error, value } = ics.createEvents(events);

            if (error) {
                console.error(error);
                return;
            }
            fs.writeFileSync(`tweets.ics`, value);
        }
      });
}

main();
