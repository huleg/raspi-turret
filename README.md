# raspi-turret
a private tinkering attempt to build a reliable sensor station for home security purposes

server.js and probe.js is non-related scripts which developed for different purposes, take a look into package.json for library depencies
visit http://psychip.net/video/new-gadget-wireless-sensor-station to read related article

you can configure them to start on boot by appending following line to system file "/etc/rc.local"

tested on node 4.4.7 + Rasbian 8 (jessie)

```javascript
su - root -c "NODE_ENV=production /usr/local/bin/node /var/<your project path>/server.js"
su - root -c "NODE_ENV=production /usr/local/bin/node /var/<your project path>/probe.js"
```

#server.js
##listens on spesific port (8585 for now) and processes incoming commands

take a photo with default parameters and render on browser
```javascript
http://<your raspi ip>:8585/dev/camera
```

record x sec video and download it
```javascript
http://<your raspi ip>:8585/dev/video/<seconds to record>
```

shutdown
```javascript
http://<your raspi ip>:8585/sys/shutdown
```

restart
```javascript
http://<your raspi ip>:8585/sys/reboot
```


#probe.js
## collects data from arduino serial port and pushes them to home automation server

configure "conf" object at line 63 before production 

08.08.2016