import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {Observable, Subscription} from 'rxjs';
import {NdefEvent} from '@ionic-native/nfc';
import {NFC} from '@ionic-native/nfc/ngx';
import {AlertController, LoadingController, Platform} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  info: string;

  loading: HTMLIonLoadingElement;
  listenAlert: HTMLIonAlertElement;

  existingObservable = false;
  ndefEventObservable: Observable<NdefEvent>;
  nfcSubscription: Subscription;

  iOS = false;

  constructor(private db: DatabaseService,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private nfc: NFC,
              private platform: Platform) {
  }

  ngOnInit(): void {
    this.info = 'No info yet';
    if (this.platform.is('ios')) {
      this.iOS = true;
    }
  }


  onDoneClicked() {

    if (this.iOS) {
      this.nfc.beginSession(
        () => {
          this.setupNFC();
        },
        () => {
          this.info = 'BeginSession Failed';
        });
    } else {
      this.setupNFC();
    }
  }

  async setupNFC() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();

    this.setNdefListener()
      .then(() => {
        return this.setNdefSubscription();
      })
      .then(() => {
        this.loading.dismiss();
        this.setReadNfcAlert();
      })
      .catch(() => {
        this.loading.dismiss();
        this.alertNfcUnavailable();
      });
  }

  setNdefListener(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.nfc.enabled()
        .then(() => {
          if (!this.existingObservable) {
            this.ndefEventObservable = this.nfc.addNdefListener();
            this.existingObservable = true;
            resolve();
          } else {
            resolve();
          }
        })
        .catch(() => {
          this.existingObservable = false;
          reject(new Error());
        });
    });
  }

  private setNdefSubscription(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.nfcSubscription = this.ndefEventObservable.subscribe((event) => {
        this.onNdefEvent(event);
      });
      resolve();
    });
  }


  private onNdefEvent(event) {
    this.listenAlert.dismiss();

    // Read from register 4
    let payload = this.nfc.bytesToString(event.tag.ndefMessage[4].payload);
    payload = payload.substring(3);

    // let restaurantName = this.nfc.bytesToString(event.tag.ndefMessage[3].payload);
    // restaurantName = restaurantName.substring(3);

    this.info = payload;

    // this.shoppingService.setOrder(payload)
    //   .then(() => {
    //     this.alertCtrl.create({
    //       message: 'Your order has been successfully submitted for: ' + restaurantName,
    //       buttons: [
    //         {text: 'Okay'}
    //       ]
    //     }).then(alertEl => {
    //       alertEl.present();
    //     });
    //   })
    //   .catch(() => {
    //     this.alertCtrl.create({
    //       message: 'There has been an error while submitting your order, please retry',
    //       buttons: [
    //         {text: 'Okay'}
    //       ]
    //     }).then(alertEl => {
    //       alertEl.present();
    //     });
    //   });
  }

  private async setReadNfcAlert() {
    this.listenAlert = await this.alertCtrl.create({
      message: 'Please approach your phone to the NFC tag',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            this.nfcSubscription.unsubscribe();
          }
        }
      ]
    });
    await this.listenAlert.present();
    await this.listenAlert.onDidDismiss().then(() => {
      this.nfcSubscription.unsubscribe();
    });
  }

  private alertNfcUnavailable() {
    this.alertCtrl.create({
      message: 'Please enable NFC first',
      buttons: [
        {
          text: 'Okay',
          role: 'cancel'
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

}
