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


console.log("Camera starting....");
myCamera.snap()
	.then(() => {
		console.log("Done clicking....");
    
    const params = {
      imagesFile: { data: fs.createReadStream('test.png'),
          contentType: 'png/jpg',
        },
      collectionIds: ['079b4d08-be4a-4f5f-94b5-9e53d6544347'],
      features: ['objects'],
      threshold:0.6
    };

		visualRecognition.analyze(params)
    .then(response => {
      var output = JSON.stringify(response.result, null, 2);
      var arr_images = output["images"];
      var objects = arr_images["objects"];
      console.log(output);
      if(objects != {} && objects.length > 0) {
        collections = objects["collections"]
        collection_objects = collections["objects"]
        console.log("no of vehicles on site is ", collection_objects.length); 
      }
    })
    .catch(err => {
      console.log('error: ', err);
    });
	})
	.catch(err => console.log('myCamera.snap error ' + err));
