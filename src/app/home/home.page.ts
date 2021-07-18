import { Component} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { File } from '@ionic-native/file/ngx';
import { ToastController, LoadingController, AlertController, NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
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
  filename = '';
  object;
  gsr: any = 0;
  showToggle:boolean = true;
  coToggle:boolean = true;
  interval;
 coordonate= {"position_timestamp": new Date().toISOString(), 'lat' : this.latitude,'lng': this.longitude,'gsr' : this.gsr };

  constructor(
    private geolocation: Geolocation,
    public file: File,
    private toastCtrl: ToastController,
    public blserial: BluetoothSerial,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public navCtrl: NavController
  ) {
    
  }
  options = {
    timeout: 10000, 
    enableHighAccuracy: true, 
    maximumAge: 3600
  };

async  toastConnect(resp){
    let toast = await this.toastCtrl.create({
      message: resp,
      duration: 3000
    });                     
  await  toast.present()
  }


  connect() {
    this.toastConnect('Connecting to Micro-controller...')
    this.blserial.connect("08:3A:F2:AC:B6:82").subscribe( (connectSuccess) => {                  
      console.log(connectSuccess);
      this.toastConnect('Succesfully connected')
      this.coToggles()
      

    }, connectCallback => {
      console.log('disconnected');
      this.toastConnect('Connection failed')
    })

  }

  disconnect(){
    this.toastConnect('Disconnecting from Micro-controller...')
    this.blserial.disconnect().then((success) => {
      console.log(success);
      this.toastConnect('Disconnected')
      this.coToggle = true;

    }, error =>{
      console.log('error disconnecting')
      this.toastConnect('Error while disconnecting')
    })
  }


startRecording(){
  if (this.filename == '') {
    this.presentAlertPrompt()
  }
  else this.getCurrentCoordinates();
}

// use geolocation to get user's device coordinates
getCurrentCoordinates() {
  this.gsr = 1702
this.interval=  setInterval(() => {
    // this.blserial.read().then((success)=>{
    //   this.gsr= success;
    // })
  this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }).then((resp) => {
    this.latitude = resp.coords.latitude;
    this.longitude = resp.coords.longitude;
   this.coordonate= {"position_timestamp": new Date().toISOString(), 'lat' : this.latitude,'lng': this.longitude,'gsr' : this.gsr };
    console.log(this.coordonate)}).finally(()=>{

      this.table.push(this.coordonate)
      console.log(this.table)
    }).catch((error) => {
     console.log('Error getting location', error);
   })
  }, 1000);
  this.interval;
}


stopRecord(){
  clearInterval(this.interval);
}

resetData(){
  clearInterval(this.interval);
  this.table.splice(0,this.table.length);
  this.latitude = 0;
  this.longitude = 0;
  this.gsr = 0;
  this.filename = ''
  this.showToggle = true;
}

async saveData(){
  let loading = await this.loadingController.create({
    cssClass: 'my-custom-class',
    message: 'Saving ...',
    duration: 1500
  });
  await loading.present();
  this.object = Object.assign({}, this.table);
  console.log(this.filename)
  this.file.writeFile(this.dir,this.filename,this.object,{replace: true})
}
showToggles(){
  if(this.showToggle == true){
    this.showToggle = false;
  }else{
    this.showToggle = true;
  }
}
coToggles(){
  if(this.coToggle == true){
    this.coToggle = false;
  }else{
    this.coToggle = true;
  }
}
async presentAlertPrompt() {
  const alert = await this.alertController.create({
    header: 'Type subject name',
    inputs: [
      {
        type: 'text',
        placeholder: 'file name'
      }
    ],
    buttons: [
      {
        text: 'Ok',
        handler: (name) => {
          this.filename=name[0];
          this.getCurrentCoordinates()
          console.log(this.filename)
        }
      }
    ]
  });
  await alert.present();
}
async resetAlert() {
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Non saved data will be lost',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      }, {
        text: 'Reset',
        handler: () => {
         this.resetData();
        }
      }
    ]
  });

  await alert.present();
}

goToMaps(){
  let navigationExtras: NavigationExtras = {
    queryParams: {
      table : this.table
    }
};
this.navCtrl.navigateForward('map', navigationExtras);
}
gsr1(){
  this.gsr = 1702
}
gsr2(){
  this.gsr = 1650
}
gsr3(){
  this.gsr = 1500
}
}