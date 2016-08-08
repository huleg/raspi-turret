/* global os */

var request = require('request/index.js');

var pi = require("./lib.raspi.js");
var tools = require("./lib.utools.js");

var fs = require("fs");
var path = require("path");

var colors = require("colors");
var SerialPort = require('serialport');
var Sound = require('node-aplay');
var moment = require("moment");

var production = true;
var logfile = "probe.log";

var colors = require('colors/safe');
var fs = require('fs');
var util = require('util');

function statPath(path) {
    try {
        return fs.statSync(path);
    } catch (ex) {
    }
    return false;
}

function GetTickCount() {
    return new Date().getTime();
}

if (production === true) {
    console.log("initializing..");
    var exist = statPath(__dirname + '/' + logfile);
    if (exist && exist.isFile()) {
        fs.unlink(__dirname + '/' + logfile);
    }
    console.log((colors.green("[SUCCESS]") + " Turret probe has been launched"));
    console.log((colors.magenta("[INFO]") + " type " + colors.grey("tail -f " + logfile + " -n 100") + " to see output"));
    console.log((colors.magenta("[INFO]") + " type " + colors.grey("killall node") + " to stop"));
    console.log("");
    require('daemon')();
    var log = fs.createWriteStream(__dirname + '/' + logfile, {flags: 'w'});
    console.log = function (d) { //
        log.write(util.format(d) + '\n');
    };
    console.log((".. process id #" + process.pid));
    var spath = process.cwd();
    console.log('.. current directory: ' + spath);
    if (spath !== __dirname) {
        try {
            process.chdir(__dirname);
            console.log('.. new directory: ' + process.cwd());
        } catch (err) {
            console.log('chdir: ' + err);
        }
    }
}

var conf = {
    server: "192.168.1.125",
    port: "8484",
    devid: "200616-004",
    serial: "/dev/ttyUSB0",
    serbaud: 57600,
    const: {
        proto: "http",
        shtimeout: "3000"
    },
    services: [
    ]
};

var mem = {
    position: 0,
    batt: 0.0,
    charging: false,
    _buf: {
        lastseen: 0,
        lastmove: 0
    },
    board: {
        uptime: 0,
        latency: 0,
        vcc: 0.0,
        temp: 0.0
    },
    acc: {
        x: 0,
        y: 0,
        z: 0
    },
    axis: {
        x: 0,
        y: 0,
        z: 0
    },
    sensor: {
        pir: 0,
        mq5: 0,
        temp: 0.0,
        light: 0
    }
};

function init() {
    conf._s = conf.const.proto + '://' + conf.server + ':' + conf.port;
}

function GetTickCount() {
    return new Date().getTime();
}

function parse(line) {
    line = line.substring(line.lastIndexOf("$") + 1, line.lastIndexOf(";"));
    var p = line.split(",");
    if (p.length <= 0) {
        return;
    }
    switch (p[0]) {
        case "TMR":
            mem.board.uptime = parseInt(p[1]);
            mem.sensor.pir = parseInt(p[2]);
            mem.board.latency = parseInt(p[3]);
            if (mem._buf.lastseen !== mem.sensor.pir) {
                mem._buf.lastseen = mem.sensor.pir;
                return 101;
            }
            return 100;
            break;
        case "ACC":
            mem.acc.x = parseInt(p[1]);
            mem.acc.y = parseInt(p[2]);
            mem.acc.z = parseInt(p[3]);
            return 110;
            break;
        case "AXIS":
            mem.axis.x = parseInt(p[1]);
            mem.axis.y = parseInt(p[2]);
            mem.axis.z = parseInt(p[3]);
            return 120;
            break;
        case "SENS":
            mem.sensor.temp = parseFloat(p[1]);
            mem.sensor.light = parseInt(p[2]);
            mem.sensor.mq5 = parseInt(p[3]);
            return 130;
            break;
        case "DEV":
            mem.batt = parseFloat(p[1]);
            mem.charging = !!+parseInt(p[2]);
            return 140;
            break;
    }
}

function push() {
    var payload = "";
    payload += "id=" + conf.devid;
    payload += "|";
    payload += "uptime=" + mem.board.uptime;
    payload += "|";
    payload += "pir=" + mem.sensor.pir;
    payload += "|";
    payload += "temp=" + mem.sensor.temp;
    payload += "|";
    payload += "light=" + mem.sensor.light;
    payload += "|";
    payload += "pir=" + mem.sensor.pir;
    payload += "|";
    payload += "mq5=" + mem.sensor.mq5;
    payload += "|";
    payload += "pos=" + mem.position;
    payload += "|";
    payload += "batt=" + mem.batt;
    payload += "|";
    payload += "latc=" + mem.board.latency;
    payload += "|";
    payload += "thrm=" + mem.board.temp;
    payload += "|";
    payload += "vcc=" + mem.board.vcc;
    request({
        uri: conf._s + "/c/pushdata/" + payload,
        method: "GET",
        timeout: 5000
    }, function (error, xresponse, body) {
        if (error || xresponse.statusCode !== 200) {
            return;
        }
    });
}

var port = new SerialPort(conf.serial, {
    baudRate: conf.serbaud,
    autoOpen: false,
    parser: SerialPort.parsers.readline('\n')
});

port.open(function (err) {
    if (err) {
        return console.log('Error opening port: ', err.message);
    }
});

port.on('open', function () {
    console.log(".. opened port " + conf.serial);
});

port.on('data', function (data) {
    var pid = parse(data);
    switch (pid) {
        case 101:
            console.log("-- movement detected");
            push();
            break;
        case 130:
            push();
            console.log("Temperature: " + mem.sensor.temp);
            console.log("Gas: " + mem.sensor.mq5);
            console.log("Light: " + mem.sensor.light);
            console.log("--------------------------------");
            break;
    }
});

console.log("Initializing judithprobe..");
init();
console.log("Started..");