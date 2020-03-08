import { Component, OnInit } from '@angular/core';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
declare var download;

import * as uniqid from 'uniqid';

// Services
import { ImageService } from '../image.service';
import { LoadingController, ModalController, Platform, AlertController } from '@ionic/angular';
import { ExplanationPage } from '../explanation/explanation.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  cameraTrigger: Subject<void> = new Subject<void>();
  switchCamera: Subject<void> = new Subject<void>();
  webcamImage: WebcamImage = null;
  showPicture = false;
  cameraError = false;

  isMobile = false;
  uploadToServer = true; // True will upload the images to the selected server and false will download the images

  selectedEmoji: any;
  photos = [];

  videoWidth = 1200;

  numberOfPictures = 25;
  delayBetweenPicutres = 300;

  photoCounter = 1;
  showCountdown = false;
  countdownNumber = "3";

  emojis = [
    {
      name: "smile",
      icon: "🙂",
      done: false
    },
    {
      name: "silence",
      icon: "🤫",
      done: false
    },
    {
      name: "thinking",
      icon: "🤔",
      done: false
    },
    {
      name: "scream",
      icon: "😱",
      done: false
    },
    {
      name: "oops",
      icon: "🤭",
      done: false
    },
    {
      name: "tongue",
      icon: "😛",
      done: false
    },
    {
      name: "surprised",
      icon: "😮",
      done: false
    }
  ]

   constructor(
    private imageService: ImageService,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              
              public platform: Platform
  ) {}

  ngOnInit(){}

  public get cameraTriggerObservable(): Observable<void> {
    return this.cameraTrigger.asObservable();
  }

  public get switchCameraObservable(): Observable<void> {
    return this.switchCamera.asObservable();
  }

  public takePicture(): void {
    this.cameraTrigger.next();
  }

  public switchCameraFunc(): void {
    this.switchCamera.next();
  }

  public handleCameraInitError(error: WebcamInitError): void {
    console.log(error)
    this.cameraError = true;
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by user!");
    }
  }

  public handleTakenPicture(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.showPicture = true;

    if(this.uploadToServer)
      this.photos.push(webcamImage.imageAsDataUrl);
    else
      download(webcamImage.imageAsDataUrl, this.selectedEmoji.name + "_" + uniqid() + ".jpeg", "image/jpeg");
  }

  pictureCollectorLoop(){
    setTimeout(() => {   
      this.takePicture();
      this.photoCounter++;
      if (this.photoCounter <= this.numberOfPictures) {            
         this.pictureCollectorLoop();            
      } else {
        if(this.uploadToServer){
          this.presentUploadConfirmationAlert();
        } else {
          this.setEmojiToDone();
          this.clearTempVariables();
        }
      }
   }, this.delayBetweenPicutres)
  }

  startPictureCollectorLoop(){
    if(this.cameraError){
      return alert("Camera Error, cannot take pictures")
    }

    if(!this.selectedEmoji){
      alert("Please select an emoji");
    } else {
      this.showCountdown = true;
      this.countdownNumber = "3";
      setTimeout(() => {
        this.countdownNumber = "2";
        setTimeout(() => {
          this.countdownNumber = "1";
          setTimeout(() => {
            this.showCountdown = false;
            this.pictureCollectorLoop();
          }, 1000)
        }, 1000)
      }, 1000)
    }
  }

  selectEmoji(emoji){
    this.selectedEmoji = emoji;
    console.log("Switched to ", this.selectedEmoji.name);
  }

  async uploadImages(){
    let loading = await this.loadingCtrl.create({
      message: "Uploading photos..."
    });

    await loading.present();
    this.imageService.upload(this.photos, this.selectedEmoji.name).then(res => {
      loading.dismiss();
      
      this.setEmojiToDone();
      this.clearTempVariables()
    }, err => {
      loading.dismiss();
      alert("Oops error !");
    })
  }

  setEmojiToDone(){
    for(let i = 0; i < this.emojis.length; i++){
      if(this.selectedEmoji.name == this.emojis[i].name)
        this.emojis[i].done = true;
    }
  }

  clearTempVariables(){
    this.selectedEmoji = null;
    this.photos = [];
  }

  async presentUploadConfirmationAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Do you want to upload or start this emoji again ?',
      buttons: [
        {
          text: 'Start Again',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.photos = [];
          }
        }, {
          text: 'Upload',
          handler: () => {
            this.uploadImages();
          }
        }
      ]
    });

    await alert.present();
  }

  async showExplanationModal(){
    let modal = await this.modalCtrl.create({
      component: ExplanationPage
    });

    await modal.present()
  }

}
