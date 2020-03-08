import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  server = "API_ADDRESS";

  constructor(private http: HttpClient){

  }

  upload(images, category){
    return new Promise((resolve, reject) => {      
      this.http.post(this.server + '/upload/image/', { images: images, category: category })
        .subscribe((data: any) => {
          resolve(data);
        }, (err) => {
          reject(err);
        });
    });
  }

}