var Cloudant = require('@cloudant/cloudant');
let rev;
let id;
let cloudantcred = 
{
    "apikey": "-d5sJ3xIFq9zXWhKD0N3HKWKk-TxptVveBOQ_Sn3GUCJ",
    "host": "da8e6599-d774-45cd-8fbf-270eebd18408-bluemix.cloudantnosqldb.appdomain.cloud",
    "iam_apikey_description": "Auto-generated for key e8bcd432-553f-4894-8454-d91960b50679",
    "iam_apikey_name": "detectintrusion",
    "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
    "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/469476c7bf1f4737b70fa419b06ed130::serviceid:ServiceId-6f930ed9-04f0-43c2-9489-a3ce556c2668",
    "password": "e9b836e1a6b8f83709df663de54f24611449a8d7730a258a0a79af14dfff8b4e",
    "port": 443,
    "url": "https://da8e6599-d774-45cd-8fbf-270eebd18408-bluemix:e9b836e1a6b8f83709df663de54f24611449a8d7730a258a0a79af14dfff8b4e@da8e6599-d774-45cd-8fbf-270eebd18408-bluemix.cloudantnosqldb.appdomain.cloud",
    "username": "da8e6599-d774-45cd-8fbf-270eebd18408-bluemix"
  }
var cloudant = new Cloudant({ url: cloudantcred.url, plugins: { iamauth: { iamApiKey: cloudantcred.apikey } } });
const fs = require('fs');
const { validateRequestWithBody } = require('twilio/lib/webhooks/webhooks');
let db = cloudant.use('sea_level');

//db.insert({ happy: true }, 'cat') insert
//db.insert({ _id: 'cat', _rev: '1-d1628a1063a3da5e9252ee6d52a66b12', happy: false }); update
console.log("updating");


let weatherinfo = function weather_update(details,id) {
    console.log("updating weather");
    db.get(id).then((body) => {
        let rev = body._rev;
        
        db.insert({ _id: id, _rev: rev, windspeed: details["windspeed"], Temperature: details["temperature"], Humidity: details["humidity"],cloud_cover:details["cloud cover "] }).then((body) => {
                console.log(body);
                });
       
    })

}
function clearattachments(rev,image_name,id) {
    fs.readFile('test.png', (err, data) => { 
        if (!err) {
        db.attachment.destroy(id, 'test.png',
            {rev: rev}).then((body) => {
                rev = body._rev;
                console.log(body);
            })
        }
    })
}
function addattachments(rev,image_name,id) {
    fs.readFile('test.png', (err, data) => { 
        if (!err) {
        db.attachment.insert(id, 'test.png', data, 'image/png',
                { rev: rev }).then((body) => {
                    rev = body._rev;
                    console.log(body);
            }); 
        }
    })

}
let creation = function (lat,long,time,id) {
    db.insert({exists: true, latitude:lat, longitude:long,time: time },id).then((body) => {
        id = body._id;
        rev = body._rev;
        console.log(body);
    });
    console.log("added");
}
let update_image = function (image_name,id) {
    console.log("id",id);
    db.get(id).then((body) => { 
        console.log("attempting storing image",body);
        rev = body._rev;
        if(body._attachments) {
            console.log("exists");
            clearattachments(rev,image_name,id);
        }
        addattachments(rev,'test.png',id);
    }).catch((err) => {
        console.log(err);
    });
}
let all_records = function() {
    let data = {};
    
    }
module.exports = {
    creation: creation,
    update_image: update_image,
    all_records:all_records,
    weather_update:weatherinfo
  }
  //db.attachment.getAsStream('dog', 'dog.png').pipe(fs.createWriteStream('./public/images/dog.png'));
