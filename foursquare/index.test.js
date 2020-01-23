var fs = require('fs');
var settings = JSON.parse(fs.readFileSync('local.settings.json', 'utf8'));

process.env["FOURSQUAREACCESSTOKEN"] = settings.Values.FOURSQUAREACCESSTOKEN
process.env["FOURSQUARECLIENTID"] = settings.Values.FOURSQUARECLIENTID
process.env["FOURSQUARECLIENTSECRET"] = settings.Values.FOURSQUARECLIENTSECRET

const httpFunction = require('./index');
const context = require('../testing/defaultContext')

test('Http trigger should return known text', async () => {

    const request = {
    };

    await httpFunction(context, request);

    expect(context.log.mock.calls.length).toBe(1);
//    expect(context.res.body).toEqual('Hello Bill');
    expect(context.res.status).toBe(200);
});