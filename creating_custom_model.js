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

const params = {
  name: 'vehicles',
  description: 'detecting and counting vehicles',
};

visualRecognition.createCollection(params)
  .then(response => {
    console.log(JSON.stringify(response.result, null, 2));
  })
  .catch(err => {
    console.log('error: ', err);
  });
