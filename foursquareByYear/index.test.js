var fs = require('fs');
var settings = JSON.parse(fs.readFileSync('local.settings.json', 'utf8'));

var ics2010 = fs.readFileSync('testing/2010.ics', 'utf8');

process.env["FOURSQUAREACCESSTOKEN"] = settings.Values.FOURSQUAREACCESSTOKEN
process.env["FOURSQUARECLIENTID"] = settings.Values.FOURSQUARECLIENTID
process.env["FOURSQUARECLIENTSECRET"] = settings.Values.FOURSQUARECLIENTSECRET

function removeDTSTAMP(data) {
    let dataArray = data.split('\n'); // convert file data in an array
    const searchKeyword = 'DTSTAMP'; // we are looking for a line, contains, key word 'user1' in the file
    let lastIndex = -1; // let say, we have not found the keyword

    for (let index=0; index<dataArray.length; index++) {
        if ((dataArray[index].includes(searchKeyword))) { // check if a line contains the 'user1' keyword
            lastIndex = index; // found a line includes a 'user1' keyword
            dataArray.splice(lastIndex, 1); // remove the keyword 'user1' from the data Array
        }
    }
    let result = dataArray.join('\n');
    return result
}

const httpFunction = require('./index');
const context = require('../testing/defaultContext')

test('Http trigger should return known text', async () => {
    const logger = jest.fn();
    const request = {
    };

    await httpFunction(context, request);

    expect(context.log.mock.calls.length).toBe(1);
    expect(removeDTSTAMP(context.res.body)).toEqual(removeDTSTAMP(ics2010));
    expect(context.res.status).toBe(200);
});