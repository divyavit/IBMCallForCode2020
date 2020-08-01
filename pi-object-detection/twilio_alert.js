const fs = require('fs');
const VisualRecognitionV4 = require('ibm-watson/visual-recognition/v4');
const { IamAuthenticator } = require('ibm-watson/auth');
const credentials = {
  "apikey": "RgP_01bio23S5C6szlGeO98QfjcZ--APjY1PF_ccGRcY",
  "iam_apikey_description": "Auto-generated for key 8161b4d4-55ac-468b-89f6-e984dfd3c158",
  "iam_apikey_name": "Auto-generated service credentials",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/469476c7bf1f4737b70fa419b06ed130::serviceid:ServiceId-73e0245a-096a-4ed6-8b2a-0390bf28a790",
  "url": "https://api.us-south.visual-recognition.watson.cloud.ibm.com/instances/56188a25-152e-4ce5-a69d-2b16e0d3453e"
}

const accountSid = 'ACc5deb70148baf04d2ca30b6495dde00c';
const authToken = '13934b2bff3c91c41bdd6f142c1c5d8b';
const client = require('twilio')(accountSid, authToken);


const visualRecognition = new VisualRecognitionV4({
  version: '2019-02-11',
  authenticator: new IamAuthenticator({
    apikey: credentials.apikey
  }),
  url: credentials.url,
});

const fname = "test.png";
const PiCamera = require('pi-camera');

const myCamera = new PiCamera({
	mode: 'photo',
	output: fname,
	nopreview: true
});
console.log("ready to take picture");
let snap = function () {
  console.log("Camera starting....");
  myCamera.snap()
    .then(() => {
      console.log("Done clicking....");
      
      const params = {
        imagesFile: { data: fs.createReadStream('testimage1.jpeg'),
            contentType: 'png/jpg/jpeg',
          },
        collectionIds: ['079b4d08-be4a-4f5f-94b5-9e53d6544347'],
        features: ['objects'],
        threshold:0.2
      };
      let direction = "top";
      let top_vehicle_pos = []
      let top_river_pos = [];
        
        
      visualRecognition.analyze(params)
      .then(response => {
        var output = JSON.stringify(response.result, null, 2);
        var json_output = response.result;
        var arr_images = json_output["images"];
        console.log(arr_images);
        var single_image = arr_images[0];
        var objects = single_image["objects"];
        console.log("objects is",objects);
        if(objects != {}  && objects.collections != undefined) {
          var collections_array = objects["collections"];
          if(collections_array.length > 0){
            var single_collection = collections_array[0];
            var collection_objects = single_collection["objects"];
            console.log("objects collection is ",collection_objects);
            if(direction == "top") {
              for(let i=0;i<collection_objects.length;i++) {
                let each = collection_objects[i];
                if(each.object == 'vehicle') {
                  top_vehicle_pos.push(each.location.top);
                }
                else {
                  top_river_pos.push(each.location.top);
                }
              }
            for(let j=0;j<top_vehicle_pos.length;j++) {
              for(let k=0;k<top_river_pos.length;k++) {
                if(top_river_pos[k] - top_vehicle_pos[j] < 5) {
                  console.log("Too close to river please stop");
                  client.messages
                  .create({
                    body: 'too close to river',
                    from: '+12058391333',
                    to: '+917893942120'
                  })
                  .then(message => console.log(message.sid)); 
                }
              }
            }
          }
                  
            console.log("no of vehicles on site is ", collection_objects.length); 
          }
        }
        let no_of_trucks = 0;
        if(collection_objects!=undefined) {
        if(collection_objects.length > 0){
        no_of_trucks = collection_objects.length;
      }
    }
    if(no_of_trucks > 2) {
        client.messages
        .create({
          body: 'Illegal sand mining with trucks',
          from: '+12058391333',
          to: '+917893942120'
        })
        .then(message => console.log(message.sid)); 
      }
      })
      .catch(err => {
        console.log('error: ', err);
      });
    })
    .catch(err => console.log('myCamera.snap error ' + err));
    }
module.exports = {
  snap:snap
}
