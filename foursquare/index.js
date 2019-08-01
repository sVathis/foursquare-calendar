var
    ics = require('ics'),
    foursquare = require('./foursquare')

module.exports = async function (context, req) {
    context.log('Requesting current year Foursquare events');

    let details = await foursquare.doSelfDetails();

    let checkins = await foursquare.get("current","current");

    const { error, value } = ics.createEvents(checkins);
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
                    'Content-Disposition': 'attachment; filename="current.ics"'},
        body: value
    };
}