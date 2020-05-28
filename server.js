
const INITIAL_SPEED = 30;
const SPEED_INCREMENT_PERCENTAGE = 10;
const PIN_STATE_FORWARD = 1;
const PIN_STATE_REVERSE = 0;

const STOP = 'stop';
const FORWARD = 'forward';
const REVERSE = 'reverse';
const SOFT_RIGHT = 'soft right';
const SOFT_LEFT = 'soft left';
const HARD_RIGHT = 'hard right';
const HARD_LEFT = 'hard left';

var pwmRightVal = 0;
var pwmLeftVal = 0;

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const gpio = require('pigpio').Gpio;
const { exec } = require('child_process');

var pwmPinRight = new gpio(5, {mode: gpio.OUTPUT});
var pwmPinLeft = new gpio(6, {mode: gpio.OUTPUT});
var dirPinRight = new gpio(13, {mode: gpio.OUTPUT});
var dirPinLeft = new gpio (19, {mode: gpio.OUTPUT});

var direction = STOP;
var speedPercentage = INITIAL_SPEED;

pwmPinRight.pwmWrite(0);  //makes sure the car is stopped when the program starts
pwmPinLeft.pwmWrite(0);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log('a user connected');
	speedPercentage = INITIAL_SPEED;
	controlDirection(STOP);
	io.emit('direction update', direction);
	io.emit('speed update', speedPercentage);
	socket.on('direction request', (dirReq) => {
		controlDirection(dirReq);
		console.log(direction);
		io.emit('direction update', direction);
	});
	socket.on('speed request', (speedReq) => {
		controlSpeed(speedReq);
		console.log(speedReq);
		io.emit('speed update', speedPercentage);
	});
	socket.on('disconnect', () => {
		console.log('user disconnected -> car stopped');
		controlDirection(STOP);
	});
	socket.on('shutdown', () => {
		console.log('shutting down -> car stopped');
		controlDirection(STOP);
		exec('shutdown -h now', (error, stdout, stderr) => {
			if (error) {
				console.error('exec error: ${error}');
				return;
			}
			console.log('stdout: ${stdout}');
			console.error('stderr: ${stderr}');
		});
	});
});

http.listen(8089, () => {
	console.log('listening on :8089');
});

function controlDirection(dir) {
	pwmRightVal = map(speedPercentage, 0, 100, 0, 255);
	pwmLeftVal = pwmRightVal;
	direction = dir;
	switch (dir) {
		case 'stop':
			pwmPinRight.pwmWrite(0);
			pwmPinLeft.pwmWrite(0);
			break;
		case 'forward':
			pwmPinRight.pwmWrite(pwmRightVal);
			pwmPinLeft.pwmWrite(pwmLeftVal);
			dirPinRight.digitalWrite(PIN_STATE_FORWARD);
			dirPinLeft.digitalWrite(PIN_STATE_FORWARD);
			break;
		case 'reverse':
			pwmPinRight.pwmWrite(pwmRightVal);
			pwmPinLeft.pwmWrite(pwmLeftVal);
			dirPinRight.digitalWrite(PIN_STATE_REVERSE);
			dirPinLeft.digitalWrite(PIN_STATE_REVERSE);
			break;
		case 'hard left':
			pwmPinRight.pwmWrite(255); //100% speed for hard turns
			pwmPinLeft.pwmWrite(255);  //100% speed for hard turns
			//pwmPinRight.pwmWrite(pwmRightVal);
			//pwmPinLeft.pwmWrite(pwmLeftVal);
			dirPinRight.digitalWrite(PIN_STATE_FORWARD);
			dirPinLeft.digitalWrite(PIN_STATE_REVERSE);
			break;
		case 'hard right':
			pwmPinRight.pwmWrite(255); //100% speed for hard turns
			pwmPinLeft.pwmWrite(255);  //100% speed for hard turns
			//pwmPinRight.pwmWrite(pwmRightVal);
			//pwmPinLeft.pwmWrite(pwmLeftVal);
			dirPinRight.digitalWrite(PIN_STATE_REVERSE);
			dirPinLeft.digitalWrite(PIN_STATE_FORWARD);
			break;
		case 'soft left':
			pwmPinRight.pwmWrite(pwmRightVal);
			pwmPinLeft.pwmWrite(Math.trunc(pwmLeftVal/2)); //divided to make left side slower
			dirPinRight.digitalWrite(PIN_STATE_FORWARD);
			dirPinLeft.digitalWrite(PIN_STATE_FORWARD);
			break;
		case 'soft right':
			pwmPinRight.pwmWrite(Math.trunc(pwmRightVal/2));
			pwmPinLeft.pwmWrite(pwmLeftVal);
			dirPinRight.digitalWrite(PIN_STATE_FORWARD);
			dirPinLeft.digitalWrite(PIN_STATE_FORWARD);
			break;
	}
}

function controlSpeed(speed) {
	switch(speed) {
		case 'increase':
			if(speedPercentage <= (100 - SPEED_INCREMENT_PERCENTAGE)) {
				speedPercentage += SPEED_INCREMENT_PERCENTAGE;
			}
			break;
	case 'decrease':
		if(speedPercentage >= SPEED_INCREMENT_PERCENTAGE) {
			speedPercentage -= SPEED_INCREMENT_PERCENTAGE;
		}
		break;
	}
}

function map(value, in_min, in_max, out_min, out_max) {
	var tempValue = ((value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
	tempValue = Math.trunc(tempValue);
	return tempValue;
}


