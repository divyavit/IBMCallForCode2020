var SerialPort = require('serialport');
const parsers = SerialPort.parsers;
var Sylvester = require('sylvester');
var Kalman = require('kalman').KF;
console.log("gps module called");
var gps_location = function() {
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
		  info["lat"] = gps.state.lat;
		  info["long"] = gps.state.long;
		  info["time"] = gps.state.time;
		  console.log("lat",gps.state.lat);
		  console.log("long",gps.state.lon);
		console.log("time",gps.state.time);
			
		}
		//io.emit('state', gps.state);
		prev.lat = gps.state.lat;
		prev.lon = gps.state.lon;
		
	});

	parser.on('data', function(data) {
		gps.update(data);
	  });
	return info;
};
module.exports = gps_location;
