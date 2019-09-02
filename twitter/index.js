var
    ics = require('ics'),
    twitter = require('./twitter')

module.exports = async function (context, req) {
    context.log('Requesting Twitter events');

    let tweets = await twitter.get();

    const { error, value } = ics.createEvents(tweets);
    if (error) {
        console.error("Error: " + error)
        context.res = {
        status: 400,
        body: error
        }
    }
    context.res = {
        status: 200, /* Defaults to 200 */
        headers : { 'Content-Type': 'text/calendar; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="tweets.ics"'},
        body: value
    };
}