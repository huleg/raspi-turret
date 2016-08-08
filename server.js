/* global os */

var pi = require("./lib.raspi.js");
var colors = require("colors");
var http = require('http');
var url = require('url');
var getIP = require('ipware')().get_ip;
var fs = require("fs");
var path = require("path");
var util = require('util');

var production = true;
var logfile = "server.log";


function statPath(path) {
    try {
        return fs.statSync(path);
    } catch (ex) {
    }
    return false;
}

if (production === true) {
    console.log("initializing..");
    var exist = statPath(__dirname + '/' + logfile);
    if (exist && exist.isFile()) {
        fs.unlink(__dirname + '/' + logfile);
    }
    console.log((colors.green("[SUCCESS]") + " Sensor server has been launched"));
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

var contentTypes = {
    ".htm": "text/html",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".jpeg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".cur": "image/vnd.microsoft.icon",
    ".json": "application/json",
    ".ttf": "font/truetype",
    ".otf": "font/opentype",
    ".swf": "application/x-shockwave-flash",
    ".eot": "application/vnd.ms-fontobject",
    ".woff": "application/x-font-woff",
    ".mp4": "video/mp4",
    ".h264": "video/H264"
};

var cmdb = [
    'sudo raspistill -o tmp/camera_%filename%.jpg --nopreview --thumb none -vf',
    'sudo raspivid -o tmp/video_%filename%.h264 --nopreview -sh 25 -br 50 -ev -ex=auto -t %time% -w 1280 -h 720 -fps 25 -b 14000000 -vf',
    'sudo shutdown -h now',
    'sudo shutdown -r now'
];

function GetTickCount() {
    return new Date().getTime();
}

function pushfile(filename, response) {
    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        if (fs.statSync(filename).isDirectory()) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write(filename + " is a directory\n");
            response.end();
            return;
        }
        fs.readFile(filename, "binary", function (err, file) {
            if (err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
            var headers = {};
            var stats = fs.statSync(filename);
            headers["Content-Length"] = stats["size"];
            headers["Content-Type"] = contentTypes[path.extname(filename)] || "text/plain";
            headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate";
            headers["Content-Disposition"] = 'inline; filename="' + path.basename(filename) + '"';

            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
        });
    });
}

console.log("Initializing web daemon..");
http.createServer(function (req, res) {

    var conn = {
        params: url.parse(req.url).pathname.substring(1).split("/"),
        ipaddr: req.headers['x-forwarded-for'] || (function () {
            return getIP(req, true).clientIp.replace(/::ffff:/, "").trim();
        })() || "unknown",
        ua: req.headers['user-agent'] || 'unknown'
    };

    console.log("incoming request: " + req.url);

    switch (conn.params[0]) {
        case "dev":
            switch (conn.params[1]) {
                case "camera":
                    console.log("picture request");
                    var start = GetTickCount();
                    var cmd = cmdb[0];
                    cmd = cmd.replace("%filename%", start);
                    pi.execute(cmd, function () {
                        var now = GetTickCount();
                        console.log("captured in " + (now - start) + " ms");
                        pushfile("tmp/camera_" + start + ".jpg", res);
                        var end = GetTickCount();
                        console.log("transferred in " + (end - now) + " ms");
                    });
                    break;
                case "video":
                    console.log("record request");
                    var start = GetTickCount();
                    var cmd = cmdb[1];
                    var param = parseInt(conn.params[2]);

                    if (param <= 0) {
                        param = 10;
                    }

                    cmd = cmd.replace("%time%", (param * 1000));
                    cmd = cmd.replace("%filename%", start);
                    pi.execute(cmd, function () {
                        var now = GetTickCount();
                        console.log("recorded in " + (now - start) + " ms");
                        pushfile("tmp/video_" + start + ".h264", res);
                        var end = GetTickCount();
                        console.log("transferred in " + (end - now) + " ms");
                    });
                    break;
                default:
                    pushfile("none", res);
            }
            break;
        case "sys":
            switch (conn.params[1]) {
                case "shutdown":
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.write("Shutting down.\n");
                    res.end();
                    setTimeout(function () {
                        pi.execute(cmdb[2]);
                    }, 1000);
                    break;
                case "reboot":
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.write("Rebooting.\n");
                    res.end();
                    setTimeout(function () {
                        pi.execute(cmdb[3]);
                    }, 1000);
                    break;
                default:
                    pushfile("none", res);
            }
            break;
        default:
            pushfile("none", res);
    }

}).listen(8585);
console.log("Started..");