const express = require('express')
const app = express();
var bodyParser = require('body-parser')
const router = express.Router();
app.engine('pug', require('pug').__express)
app.set('view engine','pug');
app.set('views','./views');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json())
let db_update = require('./database/new_location.js');
app.use(express.static(__dirname+'/public'));
let serverport = 3000;
let detection = require('./pi-object-detection/twilio_alert.js');
const fs = require('fs');
var Cloudant = require('@cloudant/cloudant');
let weather = require('./weather-api-nodejs/app.js')
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

let db = cloudant.use('sea_level');
var SerialPort = require('serialport');
const parsers = SerialPort.parsers;
var Sylvester = require('sylvester');
var Kalman = require('kalman').KF;
console.log("gps module called");

let lat,long,time;
let monitoring_database = [];

console.log("GPS MODULE RUNNING............");
const parser = new parsers.Readline({
	  delimiter: '\r\n'
	});


	var port = new SerialPort('/dev/serial0', {
	  //parser: SerialPort.parsers.readline('\r\n'), 
	  baudRate: 9600,
	});

	port.pipe(parser);

	var GPS = require('gps');
	var gps = new GPS;
	gps.state.bearing = 0;

	let info = {};
	var prev = {lat: null, lon: null};
	gps.on('data', function(data) {
	  if (prev.lat !== null && prev.lon !== null) {
		  gps.state.bearing = GPS.Heading(prev.lat, prev.lon, gps.state.lat, gps.state.lon);
		  info["lat"] = prev.lat;
		  info["long"] = prev.lon;
		  info["time"] = gps.state.time;
		  lat = prev.lat;
		  long = prev.lon;
		  time = gps.state.time;
		  console.log("lat",lat);
		  console.log("long",long);
		}
		//io.emit('state', gps.state);
		prev.lat = gps.state.lat;
		prev.lon = gps.state.lon;
		
	});

	parser.on('data', function(data) {
		gps.update(data);
	  });
if(lat!= null && long!= null) {
	console.log(lat);
	console.log(long);
	let count = 0
	let id = lat.toString() + '+' + long.toString();
	let wind_speeds = [] ;
	let temperature = [];
	let humidity = [];
	db_update.creation(lat,long,time,id);
	setInterval(function(){ 
		detection.snap();
		let details = weather.callcurrentDemands(lat,long);
		db_update.weather_update(details,id);
		db_update.image_update('test.png',id);
	 },10000);

	//let database = db_update.all_records();
	let database;
	let records = [];
	let min = 100000;
	let hum = 100000;
	app.get('/',function(req,res){
		db.list().then((body) => {
			database = body;
			let documents = database.rows;
			for(i = 0 ;i < documents.length;i++) {
				let row = documents[i];
				let each_id = row.id;
				db.get(each_id).then((body) => {
					if(body.latitude && body.longitude)
					{
						records.push(body);
						if(body.windspeed !=undefined) {
							if(min>body.windspeed) {
								min = windspeed;
							}
						}
						if(body.Humidity !=undefined) {
							if(hum>body.Humidity) {
								hum = body.Humidity;
							}
						}
						let name = body._id;
						db.attachment.getAsStream(id, 'test.png').pipe(fs.createWriteStream('./public/images/'+name+'.png'));
					}
				})
			}
		})
		console.log(min);
		console.log(hum);
		for(i = 0;i<records.length;i++) {
			console.log(records[i]);
		}
		res.render('index',{records:records});
	})

	app.listen(serverport, () => console.log('The server running on Port '+serverport));
}
