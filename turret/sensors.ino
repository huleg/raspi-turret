
// constants
#define INTVREF 1.08
#define ADCDELAY 15
float R1 = 30000.0; 
float R2 = 7500.0;

// pin connections
#define DS18PIN 10
#define PIRPIN 11
#define LDR A1
#define VPIN A2
#define MQ9 A3

// variables
float vout = 0.0;
int battraw = 0;
int pirstate;

long lastDebounceTime = 0;
long debounceDelay = 10;   
int lastpirstate = LOW;

OneWire ds(DS18PIN);

void initsensors() {
  pinMode(VPIN, INPUT);
  pinMode(MQ9, INPUT);
  pinMode(PIRPIN,INPUT_PULLUP);
  analogReference(INTERNAL); 
}

void readsensors () {
 
  analogRead(VPIN);
  delay(ADCDELAY);
  analogRead(VPIN);
  delay(ADCDELAY);
  battraw = analogRead(VPIN);
  delay(ADCDELAY);
  
  analogRead(MQ9);
  delay(ADCDELAY);
  analogRead(MQ9);
  delay(ADCDELAY);
  mq9gas = analogRead(MQ9);

  analogRead(LDR);
  delay(ADCDELAY);
  analogRead(LDR);
  delay(ADCDELAY);
  lightlevel = analogRead(LDR);
  
  vout = (battraw * INTVREF) / 1024.0;
  batt = vout / (R2/(R1+R2));
  envtemp = getTemp();  
}


float getTemp(){
  byte data[12];
  byte addr[8];

  if ( !ds.search(addr)) {
    ds.reset_search();
    return -1000;
  }

  if ( OneWire::crc8( addr, 7) != addr[7]) {
   // Serial.println("CRC is not valid!");
    return -1000;
  }

  if ( addr[0] != 0x10 && addr[0] != 0x28) {
  //  Serial.print("Device is not recognized");
    return -1000;
  }

  ds.reset();
  ds.select(addr);
  ds.write(0x44,1); // start conversion, with parasite power on at the end

  byte present = ds.reset();
  ds.select(addr);    
  ds.write(0xBE); // Read Scratchpad

  for (int i = 0; i < 9; i++) { // we need 9 bytes
    data[i] = ds.read();
  }

  ds.reset_search();
  byte MSB = data[1];
  byte LSB = data[0];
  float tempRead = ((MSB << 8) | LSB); //using two's compliment
  float TemperatureSum = tempRead / 16;
  return TemperatureSum;
}

boolean checkpir() {
   int reading = digitalRead(PIRPIN);  
   if (reading != lastpirstate) { 
     lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != pirstate) {
      pirstate = reading;
      if (pirstate == LOW) {
       pir=millis();
       return true;
      }
    }
  }
  lastpirstate = reading;
return false;
}
