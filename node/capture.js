const PiCamera = require('pi-camera');

const myCamera = new PiCamera({
	mode: 'photo',
	output: '/output/test.png',
	nopreview: true
});

myCamera.snap()
	.then(result => console.log('Success ' + result))
	.catch(err => console.log('Error ' + err));