import { Component, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { File } from '@ionic-native/file/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  latitude: any = 0; //latitude
  longitude: any = 0; //longitude
  table= [] ;
  dir= 'file:///storage/emulated/0/';
  filename = 'GPSDATA';
  object;
  constructor(
    private geolocation: Geolocation,
    public file: File
  ) {}
  options = {
    timeout: 10000, 
    enableHighAccuracy: true, 
    maximumAge: 3600
  };

// use geolocation to get user's device coordinates
getCurrentCoordinates() {
  setInterval(() => {
  this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }).then((resp) => {
    this.latitude = resp.coords.latitude;
    this.longitude = resp.coords.longitude;
   var coordonate= {"position_timestamp": new Date().toISOString(), 'latitude' : this.latitude,'longitude': this.longitude};
    console.log(coordonate)
    this.table.push(coordonate)
    console.log(this.table)
   }).catch((error) => {
     console.log('Error getting location', error);
   })
  }, 3000);
}
saveData(){
  this.object = Object.assign({}, this.table);
  this.file.writeFile(this.dir,this.filename,this.object,{replace: true})
}
}