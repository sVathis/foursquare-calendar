var fs = require('fs');
var settings = JSON.parse(fs.readFileSync('local.settings.json', 'utf8'));

process.env["FOURSQUARE_ACCESS_TOKEN"] = settings.Values.FOURSQUARE_ACCESS_TOKEN
process.env["FOURSQUARE_CLIENT_ID"] = settings.Values.FOURSQUARE_CLIENT_ID
process.env["FOURSQUARE_CLIENT_SECRET"] = settings.Values.FOURSQUARE_CLIENT_SECRET

const httpFunction = require('./index');
const context = require('../testing/defaultContext')

test('Http trigger should return known text', async () => {

    const request = {
//        query: { name: 'Bill' }
    };

    await httpFunction(context, request);

    expect(context.log.mock.calls.length).toBe(1);
//    expect(context.res.body).toEqual('Hello Bill');
    expect(context.res.status).toBe(200);
});