import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from "@angular/router";
declare var google;
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address: string;
  Latlngs : any[] = []
  table= [];
  latitude: number;
  longitude: number;
  coordinates = {lat:0 ,lng:0}
  values: {lat:0, lng:0}
  constructor(private geolocation: Geolocation,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.table = params["table"];
  });
    // for (var i =0; i<this.table.length ; i++) {
    //   this.coordinates= {lat : this.table[i].lat, lng: this.table[i].lng };
    //   this.Latlngs.push(this.coordinates);
      
    // }
    // for (var i =0; i<this.table.length ; i++) {
    //     if (this.table[i].GSR > 2200){
    //       this.values= {lat : this.table[i].lat, lng: this.table[i].lng };
    //       this.Latlngs.push(this.coordinates);
    //     }

      
    // }
    this.loadMap();
  }
  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }


      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      for (var i = 0; i < this.table.length-1; i++) {
        if (this.table[i].gsr  < 1600 ){
          var PathStyle = new google.maps.Polyline({
            path: [this.table[i], this.table[i+1]],
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 5,
          });
          PathStyle.setMap(this.map)
        }
       else if (this.table[i].gsr < 1700 && this.table[i].gsr > 1600 ){
        var PathStyles = new google.maps.Polyline({
          path: [this.table[i], this.table[i+1]],
          strokeColor: "#FFAA00",
          strokeOpacity: 1.0,
          strokeWeight: 5,          
        });
        PathStyles.setMap(this.map)
      }
    else  if (this.table[i].gsr  >= 1700 ){
        var PathStyless = new google.maps.Polyline({
          path: [this.table[i], this.table[i+1]],
          strokeColor: "#33FF00",
          strokeOpacity: 1.0,
          strokeWeight: 5,
          
        });
        PathStyless.setMap(this.map)
      }

      }
      const bikePath = new google.maps.Polyline({
        path: this.Latlngs,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 15,
      });

      bikePath.setMap(this.map);
    
      this.map.addListener('dragend', () => {

        this.latitude = this.map.center.lat();
        this.longitude = this.map.center.lng();

      });

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }



}
