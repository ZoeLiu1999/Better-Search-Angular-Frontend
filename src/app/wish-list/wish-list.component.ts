import {Component, EventEmitter, Input, Output} from '@angular/core';
import {forkJoin} from "rxjs";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.css']
})
export class WishListComponent {
  @Input() currentWishList;

  @Output() removeFromWishList = new EventEmitter();
  @Output() addToWishList = new EventEmitter();
  //Progress bar
  loading = false;
  progress = 0;
  //Detail Table
  lastOpenItem: any;
  isDetail = false;
  itemDetail : any;
  photosearchList : any;
  itemInfo: any;
  similarProduct: any;


  constructor( private http: HttpClient) {}

  onListClick(){
    this.isDetail = false;
  }

  onDetail(){
    this.isDetail = true;
  }

  async onItemClick(item){
    this.loading = true;
    this.progress = 50;
    this.lastOpenItem = item;
    const itemId = item.itemId;
    const itemTitle = item.title;
    const URL = `http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/get_item_info?itemId=${itemId}`;
    const photosearch_URL = `http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/get_item_photo?itemTitle=${itemTitle}`;
    const similarproduct_URL = `http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/get_similar?itemId=${itemId}`;
    const similarSearchObservable = this.http.get(similarproduct_URL);
    const photoSearchObservable = this.http.get(photosearch_URL);
    const detailObservable = this.http.get(URL);
    this.itemInfo = item;
    forkJoin([photoSearchObservable, detailObservable, similarSearchObservable]).subscribe(([response1, response2, response3]) => {
      this.photosearchList = response1; // Handle the response of the first request
      this.itemDetail = response2; // Handle the response of the second request
      this.similarProduct = response3;

      this.progress = 100;
      setTimeout(() => {
        this.loading = false;
      }, 500);
      this.isDetail = true;
    });
  }

  checkPresent(){
    if(this.lastOpenItem && this.currentWishList.includes(this.lastOpenItem)) return false;
    return true;
  }
  onRemoveWishList(item){
    this.removeFromWishList.emit(item);
  }

  onWishList(item){
    this.addToWishList.emit(item);
  }

  calculateTotalPrice(){
    return "$"+this.currentWishList.reduce((total, item) => (total + (parseFloat(item.price) || 0)), 0);
  }

  checkShippingCost(item){
    if(item.shippingCost){
      if(item.shippingCost==='0.0') {
        return "Free Shipping"
      } else{
        return "$"+item.shippingCost
      }
    } else{
      return "N/A"
    }
  }


}
