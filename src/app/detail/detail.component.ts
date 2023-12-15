import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {ModalComponent} from "../modal/modal.component";
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';



@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit{
  @Input() itemDetail : any;
  @Input() photosearchList: any;
  @Input() itemInfo: any;
  @Input() similarProduct: any;
  @Input() currentWishList: any;

  @Output() changeState = new EventEmitter();
  @Output() addItemTowishList = new EventEmitter();
  @Output() removeItemFromwishList = new EventEmitter();


  modalRef: MdbModalRef<ModalComponent> | null = null;
  maxProduct = 5;
  sortCategories: string[] = ['Default', 'Product Name', 'Days Left', 'Price', 'Shipping Cost'];
  selectedSortCategory: string = 'Default';
  selectedSortOrder: string = 'Ascending';
  productDisplay:any;

  tabs: TabItem[] = [
    { title: 'Product' },
    { title: 'Photos' },
    { title: 'Shipping' },
    { title: 'Seller' },
    { title: 'Similar Products' }
  ];
  activeTabIndex: number = 0;

  activateTab(index: number): void {
    this.activeTabIndex = index;
  }


  constructor(private modalService: MdbModalService) {}

  ngOnInit() {
    const facebookShareImage = document.getElementById('facebook-share-image');
    if (facebookShareImage) {
      facebookShareImage.addEventListener('click', () => {
        this.shareOnFacebook(this.itemDetail.ViewItemURLForNaturalSearch); // Replace with the URL you want to share
      });
    }
  }

  isInWishList(): boolean {
    if(this.currentWishList.length==0) return false;
    return this.currentWishList.some(obj => obj.itemId == this.itemInfo.itemId[0]);
  }

  shareOnFacebook(url: string) {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
  }


  onListClick() {
    this.changeState.emit(); // Emit the event when the button is clicked
  }

  onWishList(){
    this.addItemTowishList.emit(this.itemInfo)
  }

  onRemoveWishList(){
    this.removeItemFromwishList.emit(this.itemInfo)
  }

  openModal() {
    this.modalRef = this.modalService.open(ModalComponent,{data:{list:this.itemDetail.PictureURL}})
  }

  getStartLook(num){
    if(num<10000){
      return "star_border"
    }else{
      return "stars"
    }
  }

  getStarColor(feedbackScore){
    if (feedbackScore >= 10 && feedbackScore <= 49) {
      return 'yellow';
    } else if (feedbackScore >= 50 && feedbackScore <= 99) {
      return 'blue';
    } else if (feedbackScore >= 100 && feedbackScore <= 499) {
      return '#40E0D0';
    } else if (feedbackScore >= 500 && feedbackScore <= 999) {
      return 'purple';
    } else if (feedbackScore >= 1000 && feedbackScore <= 4999) {
      return 'red';
    } else if (feedbackScore >= 5000 && feedbackScore <= 9999) {
      return 'green';
    } else if (feedbackScore >= 10000 && feedbackScore <= 24999) {
      return 'yellow';
    } else if (feedbackScore >= 25000 && feedbackScore <= 49999) {
      return '#40E0D0';
    } else if (feedbackScore >= 50000 && feedbackScore <= 99999) {
      return 'purple';
    } else if (feedbackScore >= 100000 && feedbackScore <= 499999) {
      return 'red';
    } else if (feedbackScore >= 500000 && feedbackScore <= 999999) {
      return 'green';
    } else {
      return '#C0C0C0';
    }
  }

  getDaysLeft(str){
    var temp = str.split('D');
    return temp[0].substring(1);
  }

  onShowMore(){
    this.maxProduct = 20;
  }

  onShowLess(){
    this.maxProduct = 5;
  }

  onSortChange(){
    if(this.productDisplay===undefined){
      this.productDisplay = [...this.similarProduct];
    }
    if (this.selectedSortCategory === 'Default') {
      this.selectedSortOrder = 'Ascending';
      this.productDisplay = [...this.similarProduct];
    } else if (this.selectedSortCategory === 'Product Name'){
      if(this.selectedSortOrder === 'Ascending'){
        this.productDisplay.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        this.productDisplay.sort((a, b) => b.title.localeCompare(a.title));
      }
    } else if (this.selectedSortCategory === 'Days Left'){
      if(this.selectedSortOrder === 'Ascending'){
        this.productDisplay.sort((a, b) => parseInt(this.getDaysLeft(a.timeLeft)) - parseInt(this.getDaysLeft(b.timeLeft)));
      } else {
        this.productDisplay.sort((a, b) => parseInt(this.getDaysLeft(b.timeLeft)) - parseInt(this.getDaysLeft(a.timeLeft)));
      }
    } else if (this.selectedSortCategory === 'Price'){
      if(this.selectedSortOrder === 'Ascending'){
        this.productDisplay.sort((a, b) => parseInt(a.buyItNowPrice.__value__) - parseInt(b.buyItNowPrice.__value__));
      } else {
        this.productDisplay.sort((a, b) => parseInt(b.buyItNowPrice.__value__) - parseInt(a.buyItNowPrice.__value__));
      }
    } else {
      if(this.selectedSortOrder === 'Ascending'){
        this.productDisplay.sort((a, b) => parseInt(a.shippingCost.__value__) - parseInt(b.shippingCost.__value__));
      } else {
        this.productDisplay.sort((a, b) => parseInt(b.shippingCost.__value__) - parseInt(a.shippingCost.__value__));
      }
    }

  }


  protected readonly parseFloat = parseFloat;
}

export interface TabItem {
  title: string;
}
