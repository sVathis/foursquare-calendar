var
  ics = require('ics'),
  foursquare = require('../foursquare/foursquare')

module.exports = async function (context, req) {
  var year = context.bindingData.year;

  context.log('Requesting year ' + year +' Foursquare events');
  if (year) {

    let details = await foursquare.doSelfDetails();

    let checkins = await foursquare.get(year,year);

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
                    'Content-Disposition': 'attachment; filename="'+year+'".ics"'},
        body: value
      };
    }
    else {
      context.res = {
        status: 400,
        body: "Please pass a year on the URL"
      };
    }
};