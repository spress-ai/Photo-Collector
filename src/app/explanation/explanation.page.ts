import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-explanation',
  templateUrl: './explanation.page.html',
  styleUrls: ['./explanation.page.scss'],
})
export class ExplanationPage implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  closeModal(){
    this.modalCtrl.dismiss();
  }

}
