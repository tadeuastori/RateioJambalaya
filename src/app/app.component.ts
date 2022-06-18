import { Component, OnInit, HostListener } from '@angular/core';
import { Item, ApiService } from './services/api.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'RateioJambalaya';
  items: Array<Item>;
  deviceInfo: any;
  deferredPrompt: any;
  showButton = false;
  pwaControl = false;

  @HostListener('window:beforeinstallprompt', ['$event'])

  onBeforeInstallPrompt(e) {
    console.log('PWA was available');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    
    this.pwaControl = true;
    this.checkBrowser();
  }

  onAppInstalled(e) {
    this.deferredPrompt = null;
    console.log('PWA was installed');

    this.pwaControl = true;
    this.checkBrowser();
  }


  constructor(private apiService: ApiService, private deviceService: DeviceDetectorService, private swUpdate: SwUpdate) { 
    // force update
    this.swUpdate.available.subscribe((e) => {
      window.location.reload();
    });

    window.addEventListener(
      'beforeinstallprompt',
      this.onBeforeInstallPrompt.bind(this)
    );

    window.addEventListener('appinstalled', this.onAppInstalled.bind(this));
  }

  ngOnInit() {
    this.checkBrowser();
    this.fetchData();
  }

  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.deferredPrompt = null;
      });
  }

  fetchData() {
    this.apiService.fetch().subscribe(
      (data: Array<Item>) => {
        // console.log(data);
        this.items = data;
      }, (err) => {
        console.log(err);
      }
    );
  }

  checkBrowser(){
    if(this.pwaControl){
      if(this.deviceService.isMobile()){
        this.showButton = true;
      } else {
        this.showButton = false;
      }
    } else {
      this.showButton = false;
    }    
  }

}