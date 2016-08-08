#include <Wire.h>
#include <OneWire.h>

#define AXCYCLE 25
#define SENSCYCLE 25000

unsigned long pir;
long latency;
float envtemp;
float batt;
int lightlevel;
int mq9gas;
int vsource;

int xRate, yRate, zRate;
float axisX, axisY, axisZ;

long lstart;
long lpush;
long lax;
boolean pushfull;

void setup() {
 delay(1000);
 Serial.begin(9600);
 int bmid = initBMA180();
 Serial.println(bmid, HEX);
 initsensors();
 vsource = 1;
}

void loop() {
  lstart = millis();
  pushfull=false;
  checkpir();

  if((millis()-lax)>AXCYCLE) {
    bmaReadRate();
    bmaReadAxis();
    lax = millis();
  }
  
  if((millis()-lpush)>SENSCYCLE) {
    readsensors();    
    lpush = millis();
    pushfull=true;
  }
  
  pump(pushfull);
  latency = millis()-lstart;
  delay(1);
}

void pump(boolean full) {
  Serial.print(F("$TMR,"));
  Serial.print(millis());
  Serial.print(",");
  Serial.print(pir);
  Serial.print(",");
  Serial.print(latency);
  Serial.println(";");
   
  Serial.print(F("$ACC,"));
  Serial.print(xRate);
  Serial.print(",");
  Serial.print(yRate);
  Serial.print(",");
  Serial.print(zRate);
  Serial.println(";");

  Serial.print(F("$AXIS,"));
  Serial.print(axisX);
  Serial.print(",");
  Serial.print(axisY);
  Serial.print(",");
  Serial.print(axisZ);
  Serial.println(";");
  
  if(full==true) {
  Serial.print(F("$SENS,"));
  Serial.print(envtemp);
  Serial.print(",");
  Serial.print(lightlevel);
  Serial.print(",");
  Serial.print(mq9gas);
  Serial.println(";");

  Serial.print(F("$DEV,"));
  Serial.print(batt,2);
  Serial.print(",");
  Serial.print(vsource);
  Serial.print(",");
  Serial.print(readVcc());
  Serial.print(",");
  Serial.print(GetTemp());
  Serial.println(";");  
  }
}

