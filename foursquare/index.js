var
    async = require("async"),
    moment = require('moment'),
    util = require('util'),
    nodeFoursquare = require('node-foursquare'),
    logger = require('winston'),
    ics = require('ics'),
    {writeFileSync } = require('fs')


module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello from Azure " + (req.query.name || req.body.name) + "\n" + process.env['FOURSQUARE_ACCESS_TOKEN']

        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};