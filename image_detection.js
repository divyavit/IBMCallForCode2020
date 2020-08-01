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


const fname = "test.png";
const bucket = "imagedetetection";



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
	.then(uploadImage("test.png", () => {
		console.log("Done");
		process.exit();
	}))
	.catch(err => console.log('myCamera.snap error ' + err));
	