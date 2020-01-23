var
  ics = require('ics'),
  foursquare = require('../foursquare/foursquare')

module.exports = async function (context, req) {
  var fromYear = context.bindingData.fromYear,
      toYear = context.bindingData.toYear;

  context.log('Requesting from year ' + fromYear + ' to year ' + toYear + ' Foursquare events');
  if (fromYear && toYear && fromYear <= toYear) {

    let details = await foursquare.doSelfDetails();

    let checkins = await foursquare.get(fromYear,toYear);

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
                    'Content-Disposition': 'attachment; filename="'+fromYear+'-'+toYear+'".ics"'},
        body: value
      };
    }
    else {
      context.res = {
        status: 400,
        body: "Please pass a valid year range on the URL"
      };
    }
};