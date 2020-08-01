const serviceAcctCred = {
  "apikey": "_l6MfVyZs5B79EuT35JZU4DyMJyFOkxic51MRMPBKPsG",
  "endpoints": "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
  "iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:cloud-object-storage:global:a/fe57e489c486413baae0418f50564b79:1f2d1df2-d529-4139-a6e3-291edc7e3799::",
  "iam_apikey_name": "auto-generated-apikey-710a7de2-6447-4a15-b458-311c7bb9cdb1",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/fe57e489c486413baae0418f50564b79::serviceid:ServiceId-563ecdd1-e93b-4a1a-947d-1b92f50bbda4",
  "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/fe57e489c486413baae0418f50564b79:1f2d1df2-d529-4139-a6e3-291edc7e3799::"
}
// The endpoint for the US, yours might be different
const storageEndpoint = "s3.jp-tok.cloud-object-storage.appdomain.cloud";
const { IamAuthenticator } = require('ibm-watson/auth');


// Credential for IBM Watson Visual Recognition
const visualRecognitionCred = {
  "apikey": "LmiuVjCpwgBOKadO__L44DhXc7U3As5kP2qY8WjvkRit",
  "iam_apikey_description": "Auto-generated for key 0ae66e59-de02-4480-a2e5-182b5109126b",
  "iam_apikey_name": "IBMCallForCode2020",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/fe57e489c486413baae0418f50564b79::serviceid:ServiceId-6c3d78a1-2d33-42f2-a801-d649d0738874",
  "url": "https://api.us-south.visual-recognition.watson.cloud.ibm.com/instances/3e46f5d2-b1d2-4545-9fbe-d6b9c55e4bb5"
};




const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');

const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    authenticator: new IamAuthenticator({
    apikey:visualRecognitionCred.apikey,
  }),
  url:visualRecognitionCred.url
  });



const fname = "test.png";
const bucket = "imagedetetection";
const objName = "picture.png";


const PiCamera = require('pi-camera');

const myCamera = new PiCamera({
	mode: 'photo',
	output: fname,
	nopreview: true
});





const ObjectStorageLib = require("ibm-cos-sdk");
const objectStorage = new ObjectStorageLib.S3({
	endpoint: storageEndpoint,
	apiKeyId: serviceAcctCred.apikey,
	ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: serviceAcctCred.resource_instance_id
});


const fs = require("fs");


// The image file size is less than 5 MB, so there's no need for a 
// multi-part upload
const uploadImage = (key, callback) => {

    fs.readFile(fname, (err, data) => { 
		if (err) {
			console.log(`Error reading file ${fname}: ${err}`);
			process.exit();
		}
		  	
		objectStorage.putObject({
			Bucket: bucket,
			Key: key,
			ACL: "public-read",
			Body: data
		}).promise()
		.then(callback)
		.catch(e => console.log("Image upload error: " + e))
	});
};





myCamera.snap()
	.then(uploadImage(objName, () => {
		console.log("Done uploading");
		const params = {
			url: `https://${storageEndpoint}/${bucket}/${objName}`
		};
		
		console.log(`Picture located at ${params.url}`);

		visualRecognition.classify(params, (err, response) => {
			if (err)
				console.log(err);
			else
				console.log(JSON.stringify(response, null, 2));
				
			process.exit();
		});
	}))
	.catch(err => console.log('myCamera.snap error ' + err));