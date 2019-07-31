var
    ics = require('ics'),
    foursquare = require('./foursquare')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {

        let details = await foursquare.doSelfDetails();

        let checkins = await foursquare.doCheckins(req.query.year);

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
            //body: "Hello from Azure " + (req.query.name || req.body.name) + "\n" + process.env['FOURSQUARE_ACCESS_TOKEN'] + "\n" +value
            headers : { 'Content-Type': 'text/calendar; charset=utf-8',
                        'Content-Disposition': 'attachment; filename="foursquare.ics"'},
            body: value
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
}