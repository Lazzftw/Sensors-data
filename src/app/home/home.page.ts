import { Component,ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject} from '@ionic-native/file-transfer/ngx';
import { ToastController, LoadingController, AlertController, NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { DeviceMotion, DeviceMotionAccelerationData, DeviceMotionAccelerometerOptions } from '@ionic-native/device-motion/ngx';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('barChart') barChart;

  bars: any;
  colorArray: any;
  latitude: any = 0; //latitude
  longitude: any = 0; //longitude
  speed: any= 0; //speed
  accX:any = 0;
  accY:any = 0;
  accZ:any = 0;
  table= [] ;
  dir= 'file:///storage/emulated/0/';
  filename = '';
  object;
  gsr: any = 0;
  showToggle:boolean = true;
  coToggle:boolean = true;
  interval;
 coordonate= {"position_timestamp": new Date().toISOString().substring(11, 19), 'lat' : this.latitude,'lng': this.longitude,'gsr' : this.gsr, 'speed' : this.speed, 'accelerationX' : this.accX, 'accelerationY' : this.accY, 'accelerationZ' : this.accZ};
 theTime= [];
 gsrVa=[];
 subscription;

  constructor(
    private geolocation: Geolocation,
    public file: File,
    public transfer: FileTransfer,
    private toastCtrl: ToastController,
    public blserial: BluetoothSerial,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public navCtrl: NavController,
    private deviceMotion: DeviceMotion
  ) {
  }
  options = {
    timeout: 10000, 
    enableHighAccuracy: true, 
    maximumAge: 3600
  };

  // ionViewDidEnter() {

  //     this.createBarChart();

  // }



  connect(ipadress) {
    this.toastConnect('Connecting to Micro-controller...')
    this.blserial.connect(ipadress).subscribe( (connectSuccess) => {                  
      console.log(connectSuccess);
      this.coToggles()
      this.toastConnect('Succesfully connected')
      


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
  // if (this.filename == '') {
  //   this.groupName()
  // }
  // else this.getCurrentCoordinates();
  this.groupName()
}

// use geolocation to get user's device coordinates
getCurrentCoordinates() {
  setTimeout(() => {
    this.Accelerometer()
  }, 3000);
this.interval=  setInterval(() => {
     this.blserial.read().then((success)=>{
      //  success= success.replace('\r\n','');
      if (success <= 600 ){
       this.gsr= success;}
      if (success >= 601) {
        this.gsr=this.gsr
      }
     })
    
  this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }).then((resp) => {
    console.log(resp)
    this.latitude = resp.coords.latitude;
    this.longitude = resp.coords.longitude;
    this.speed = resp.coords.speed * 3.6
   this.coordonate= {"position_timestamp": new Date().toISOString().substring(11, 19), 'lat' : this.latitude,'lng': this.longitude,'gsr' : this.gsr, 'speed': this.speed, 'accelerationX' : this.accX, 'accelerationY' : this.accY, 'accelerationZ' : this.accZ };
    console.log(this.coordonate)}).finally(()=>{
     this.table.push(this.coordonate)
      console.log(this.table)
    }).catch((error) => {
     console.log('Error getting location', error);
   })
  //  this.deviceMotion.getCurrentAcceleration().then(
  //   (acceleration: DeviceMotionAccelerationData) => console.log(acceleration),
  //   (error: any) => console.log(error)
  // );
  }, 1000);
  this.interval;
}


stopRecord(){
  clearInterval(this.interval);
  this.subscription.unsubscribe();
}

resetData(){
  clearInterval(this.interval);
  this.table.splice(0,this.table.length);
  this.latitude = 0;
  this.longitude = 0;
  this.gsr = 0;
  this.speed = 0;
  this.accX = 0;
  this.accY = 0;
  this.accZ = 0;
  this.filename = ''
  this.showToggle = true;
  this.subscription.unsubscribe();
  this.disconnect();
  this.bars.destroy();


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

async  toastConnect(resp){
  let toast = await this.toastCtrl.create({
    message: resp,
    duration: 3000
  });                     
await  toast.present()
}

async presentAlertRadio() {
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Bluetooth Device',
    message: 'Please choose your bluetooth device',
    inputs: [
      {
        name: 'D1',
        type: 'radio',
        label: 'Device 1',
        value: '3C:61:05:49:44:CA',
        handler: (res) => {
          this.filename = res.name
          console.log(this.filename)
        },
      },
      {
        name: 'D2',
        type: 'radio',
        label: 'Device 2',
        value: '84:CC:A8:12:19:86',
        handler: (res) => {
          this.filename = res.name
          console.log(this.filename)
        },
      },
      {
        name: 'D3',
        type: 'radio',
        label: 'Device 3',
        value: '84:CC:A8:11:F5:9A',
        handler: (res) => {
          this.filename = res.name
          console.log(this.filename)
        }
      },
      {
        name: 'D4',
        type: 'radio',
        label: 'Device 4',
        value: '84:CC:A8:11:F9:A2',
        handler: (res) => {
          this.filename = res.name
          console.log(this.filename)
        }
      },
      {
        name: 'D5',
        type: 'radio',
        label: 'Device 5',
        value: '94:B9:7E:6B:E9:12',
        handler: (res) => {
          this.filename = res.name
          console.log(this.filename)
        }
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
        }
      }, {
        text: 'Ok',
        handler: (res) => {
          this.connect(res)
        //   window.addEventListener("devicemotion", function(event) {
        //     // Process event.acceleration, event.accelerationIncludingGravity,
        //     // event.rotationRate and event.interval
        //     console.log(event.acceleration)
        //     console.log(event.accelerationIncludingGravity)
        //     console.log(event.rotationRate)
        //     console.log(event.interval)
        // }, true);
        }
      }
    ]
  });

  await alert.present();
}
async cycletypeAlert(){
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Ride type',
    message: 'Please select your ride',
    inputs: [
      {
        name: 'S',
        type: 'radio',
        label: 'Single ride',
        value: 'S',
        handler: (res) => {
        },
      },
      {
        name: 'R1',
        type: 'radio',
        label: 'Group ride 1',
        value: 'R1',
        handler: (res) => {
        },
        
      },
      {
        name: 'R2',
        type: 'radio',
        label: 'Group ride 2',
        value: 'R2',
        handler: (res) => {
        },
        
      },
      {
        name: 'R3',
        type: 'radio',
        label: 'Group ride 3',
        value: 'R3',
        handler: (res) => {
        },
        
      },
      {
        name: 'R4',
        type: 'radio',
        label: 'Group ride 4',
        value: 'R4',
        handler: (res) => {
        },
        
      },
      {
        name: 'R5',
        type: 'radio',
        label: 'Group ride 5',
        value: 'R5',
        handler: (res) => {
        },
        
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
        }
      }, {
        text: 'Ok',
        handler: (res) => {
          this.filename = this.filename+res
          console.log(this.filename)
          this.getCurrentCoordinates()
        }
      }
    ]
  });

  await alert.present();
}
async groupName(){
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Group Name',
    message: 'Please select your group name',
    inputs: [
      {
        name: 'Alpha',
        type: 'radio',
        label: 'Alpha',
        value: 'Alpha',
        handler: (res) => {
        },
      },
      {
        name: 'Beta',
        type: 'radio',
        label: 'Beta',
        value: 'Beta',
        handler: (res) => {
        }
      },
      {
        name: 'Gamma',
        type: 'radio',
        label: 'Gamma',
        value: 'Gamma',
        handler: (res) => {
        }
      },
      {
        name: 'Delta',
        type: 'radio',
        label: 'Delta',
        value: 'Delta',
        handler: (res) => {
        }
      },
      {
        name: 'Epsilon',
        type: 'radio',
        label: 'Epsilon',
        value: 'Epsilon',
        handler: (res) => {
        }
      },
      {
        name: 'Other',
        type: 'radio',
        label: 'Other',
        value: 'Other',
        handler: (res) => {
        }
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
        }
      }, {
        text: 'Ok',
        handler: (res) => {
          this.filename= this.filename+res
          console.log(this.filename)
          this.cycletypeAlert();
        }
      }
    ]
  });

  await alert.present();
}
createBarChart() {
  for (let i = 0; i < this.table.length; i++) {

    var times = this.table[i]['position_timestamp']
    var gsrValue = this.table[i]['gsr']
   this.gsrVa.push(gsrValue) 
  //  this.theTime.push(times)
  this.theTime.push(i)
      }
  this.bars = new Chart(this.barChart.nativeElement, {
    type: 'line',
    data: {
      labels: this.theTime,
      datasets: [{
        label: 'GSR values',
        data: this.gsrVa,
        backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
        borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
        tension:0.1,
        fill: false
      }]
    },
    options: {
      scales: {
          y: {
            beginAtZero: true
          },

      }
  
    }
  });
}
 async  downloadChart(){
    let loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Downloading ...',
      duration: 1000
    });
    await loading.present();
  //  var a = document.createElement('a');
    var b = this.bars.toBase64Image();
  //  b.download = this.filename+'.png';
  //  a.click();
  const fileTransfer: FileTransferObject = this.transfer.create();
 
    
    fileTransfer.download(b, this.dir + this.filename+'.jpg',true).then((entry) => {
        console.log('download complete: ' + entry.toURL());
    }, (error) => {
        console.log(error)
    });
}

  getAcceleration(){
    
     this.deviceMotion.getCurrentAcceleration().then(
       (acceleration: DeviceMotionAccelerationData) => console.log(acceleration),
       (error: any) => console.log(error)
     );
    // this.subscription = this.deviceMotion.watchAcceleration({frequency: 1000}).subscribe((acceleration: DeviceMotionAccelerationData) => {
    //   console.log(acceleration);
    // });
    
   
  }
  Accelerometer(){
    this.deviceMotion.getCurrentAcceleration().then(
      (acceleration: DeviceMotionAccelerationData) =>
       console.log(acceleration),
   
    //  (error: any) => console.log(error)
 
    );
    
    // Watch device acceleration
     this.subscription = this.deviceMotion.watchAcceleration({frequency: 1000}).subscribe((acceleration: DeviceMotionAccelerationData) => {
      this.accX=acceleration.x;
      this.accY=acceleration.y;
      this.accZ=acceleration.z;
    });
    
  }
}