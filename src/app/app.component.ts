import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Ebay Search';

  // SearchForm Properties
  searchForm : FormGroup;

  ZipSuggestions: string[] = [];
  conditionOptions = [
    { id: '1000', label: 'New' },
    { id: '3000', label: 'Used' },
    { id: '5000', label: 'Unspecified' },
  ];
  categoryNames = ['All Category','Art','Baby','Books','Clothing, Shoes & Accessories','Computers/Tablets & Networking',
    'Health & Beauty', 'Music','Video Games & Consoles']
  categoryValue = {
    'All Category': '0',
    'Art': '550',
    'Baby': '2984',
    'Books': '267',
    'Clothing, Shoes & Accessories': '11450',
    'Computers/Tablets & Networking': '58058',
    'Health & Beauty': '26395',
    'Music': '11233',
    'Video Games & Consoles': '1249'
  };
  // Progress Bar
  loading = false;
  progress = 0;


  //Result Table
  isResult = false;
  result : any;
  currentPage: number = 1;

  //Detail Table
  lastOpenItem: any;
  isDetail = false;
  itemDetail : any;
  photosearchList : any;
  itemInfo: any;
  similarProduct: any;

  //Wish List
  showResult = true;
  showWishList = false;
  currentWishList : any;


  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      keywords: ['', [Validators.required, this.validateKeyword]],
      category: ['0'],
      condition: this.formBuilder.array(this.conditionOptions.map(() => this.formBuilder.control(false))),
      local_pickUp: false,
      free_shipping: false,
      distance: ['10'],
      useCurrentLocation: 'true',
      customZip: [{ value: '', disabled: true }],
      zip:['00000']
    });

    this.searchForm.get('useCurrentLocation')?.valueChanges.subscribe((value) => {
      if (value === 'false') {
        this.searchForm.get('customZip')?.enable();
      } else {
        this.searchForm.get('customZip')?.disable();
      }
    });


    this.http.get<any>(`http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/getWishList`)
      .subscribe((list) => {
        this.currentWishList = list;
        console.log(this.currentWishList)
      });
  }

  validateKeyword(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value.trim() === '') {
      return { 'invalidKeyword': true };
    }
    return null;
  }

  checkShippingCost(item){
    if(item.shippingInfo && item.shippingInfo[0].shippingServiceCost && item.shippingInfo[0].shippingServiceCost[0].__value__){
      if(item.shippingInfo[0].shippingServiceCost[0].__value__==='0.0') {
        return "Free Shipping"
      } else{
        return "$"+item.shippingInfo[0].shippingServiceCost[0].__value__
      }
    } else{
      return "N/A"
    }
  }



  onCustomZipInput() {
    const query = this.searchForm.get('customZip').value;
    this.http.get<string[]>(`http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/autocomplete-location?query=${query}`)
      .subscribe((suggestions) => {

        this.ZipSuggestions = suggestions;
      });
  }


  onSuggestionSelected(suggestion: string) {
    this.searchForm.get('customZip').setValue(suggestion);
  }

  displayWith(value: string) {
    return value;
  }


  clearForm() {
    window.location.reload();
  }

  async onWishList(inputObject) {
    const copiedObject = {
      ...(inputObject.itemId && { itemId: inputObject.itemId[0] }),
      ...(inputObject.title && { title: inputObject.title[0] }),
      ...(inputObject.returnsAccepted && { returnsAccepted: inputObject.returnsAccepted[0] }),
      ...(inputObject.galleryURL && { galleryURL: inputObject.galleryURL[0] }),
      ...(inputObject.sellingStatus && inputObject.sellingStatus[0].currentPrice &&{ price: inputObject.sellingStatus[0].currentPrice[0].__value__ }),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].shippingServiceCost && { shippingCost: inputObject.shippingInfo[0].shippingServiceCost[0].__value__ }),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].shipToLocations && { shipToLocations: inputObject.shippingInfo[0].shipToLocations[0]}),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].expeditedShipping && { expeditedShipping: inputObject.shippingInfo[0].expeditedShipping[0]}),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].handlingTime && { handlingTime: inputObject.shippingInfo[0].handlingTime[0]}),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].oneDayShippingAvailable && { oneDay: inputObject.shippingInfo[0].oneDayShippingAvailable[0]}),
      ...(inputObject.storeInfo &&inputObject.storeInfo[0].storeName&& { storeName: inputObject.storeInfo[0].storeName[0] }),
      ...(inputObject.storeInfo &&inputObject.storeInfo[0].storeURL&& { storeURL: inputObject.storeInfo[0].storeURL[0] }),
      ...(inputObject.sellerInfo && inputObject.sellerInfo[0].feedbackScore &&{ feedbackScore: inputObject.sellerInfo[0].feedbackScore[0] }),
      ...(inputObject.sellerInfo && inputObject.sellerInfo[0].topRatedSeller &&{ topRatedSeller: inputObject.sellerInfo[0].topRatedSeller[0] }),
      ...(inputObject.sellerInfo && inputObject.sellerInfo[0].positiveFeedbackPercent &&{ positiveFeedbackPercent: inputObject.sellerInfo[0].positiveFeedbackPercent[0] }),
    };
    this.currentWishList.push(copiedObject);
    console.log(this.currentWishList)
    this.http.get<string>('http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/addProduct', {params: copiedObject})
      .subscribe((res) => {
      });
  }

  async onRemoveWishList(inputObject) {
    const copiedObject = {
      ...(inputObject.itemId && { itemId: inputObject.itemId[0] }),
      ...(inputObject.title && { title: inputObject.title[0] }),
      ...(inputObject.returnsAccepted && { returnsAccepted: inputObject.returnsAccepted[0] }),
      ...(inputObject.galleryURL && { galleryURL: inputObject.galleryURL[0] }),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].shippingServiceCost && { shippingCost: inputObject.shippingInfo[0].shippingServiceCost[0].__value__ }),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].shipToLocations && { shipToLocations: inputObject.shippingInfo[0].shipToLocations[0]}),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].expeditedShipping && { expeditedShipping: inputObject.shippingInfo[0].expeditedShipping[0]}),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].handlingTime && { handlingTime: inputObject.shippingInfo[0].handlingTime[0]}),
      ...(inputObject.shippingInfo && inputObject.shippingInfo[0].oneDayShippingAvailable && { oneDay: inputObject.shippingInfo[0].oneDayShippingAvailable[0]}),
      ...(inputObject.storeInfo &&inputObject.storeInfo[0].storeName&& { storeName: inputObject.storeInfo[0].storeName[0] }),
      ...(inputObject.storeInfo &&inputObject.storeInfo[0].storeURL&& { storeURL: inputObject.storeInfo[0].storeURL[0] }),
      ...(inputObject.sellerInfo && inputObject.sellerInfo[0].feedbackScore &&{ feedbackScore: inputObject.sellerInfo[0].feedbackScore[0] }),
      ...(inputObject.sellerInfo && inputObject.sellerInfo[0].topRatedSeller &&{ topRatedSeller: inputObject.sellerInfo[0].topRatedSeller[0] }),
      ...(inputObject.sellerInfo && inputObject.sellerInfo[0].positiveFeedbackPercent &&{ positiveFeedbackPercent: inputObject.sellerInfo[0].positiveFeedbackPercent[0] }),
    };

    this.currentWishList = this.currentWishList.filter(item => item.itemId !== copiedObject.itemId);
    console.log(copiedObject)
    this.http.get<String>('http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/removeProduct', {params: copiedObject})
      .subscribe((res) => {
    })
  }

  // Adding and Deleting from the WishList Section
  async onRemoveWishList1(inputObject) {
    delete inputObject._id
    this.currentWishList = this.currentWishList.filter(item => item.itemId !== inputObject.itemId);
    this.http.get<String>('http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/removeProduct', {params: inputObject})
      .subscribe((res) => {
      })
  }

  async onWishList1(inputObject) {
    delete inputObject._id
    this.currentWishList.push(inputObject);
    this.http.get<string>('http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/addProduct', {params: inputObject})
      .subscribe((res) => {
      });
  }

  isInWishList(input): boolean {
    if(this.currentWishList.length==0) return false;
    return this.currentWishList.some(obj => obj.itemId == input.itemId[0]);
  }

  changeToResult(){
    this.showWishList = false;
    this.showResult = true;
  }

  changeToWishList(){
    this.showWishList = true;
    this.showResult = false;
  }

  onDetail(){
    this.isResult =false;
    this.isDetail = true;
  }

  checkPresent(){
    if(this.itemDetail) return false;
    return true;
  }

  async onSubmit(){
    this.loading = true;
    this.progress = 50;
    this.currentPage = 1;
    this.isDetail=false;


    if(this.searchForm.get('useCurrentLocation').value == 'true'){
      this.http.get('https://api.ipify.org?format=json').pipe(
        switchMap((ipData: any) => {
          return this.http.get(`https://ipinfo.io/${ipData.ip}?token=bce9451522eb63`);
        }),
        switchMap((ipInfoData: any) => {
          this.searchForm.get('zip').setValue(ipInfoData.postal);
          var searchQuery = this.searchForm.value
          const URL = `http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/search?keywords=${searchQuery.keywords}${searchQuery.category==='0'? '':`&categoryId=${searchQuery.category}`}${searchQuery.condition[0]? '&conditions[]=1000':''}${searchQuery.condition[1]? '&conditions[]=3000':''}${searchQuery.local_pickUp? '&local_pickup=true':''}${searchQuery.free_shipping? '&free_shipping=true':''}&distance=${searchQuery.distance}&zipcode=${searchQuery.zip}`
          return this.http.get(URL);
        })
      ).subscribe((response) => {
        this.progress = 100;
        setTimeout(() => {
          this.loading = false;
        }, 500);
        this.isResult = true;
        this.result = response;
      });
    } else {
      var searchQuery = this.searchForm.value
      const URL = `http://my-nodejs-app-env.eba-weptpkjf.us-east-2.elasticbeanstalk.com/search?keywords=${searchQuery.keywords}${searchQuery.category==='0'? '':`&categoryId=${searchQuery.category}`}${searchQuery.condition[0]? '&conditions[]=1000':''}${searchQuery.condition[1]? '&conditions[]=3000':''}${searchQuery.local_pickUp? '&local_pickup=true':''}${searchQuery.free_shipping? '&free_shipping=true':''}&distance=${searchQuery.distance}&zipcode=${searchQuery.customZip}`
      this.http.get(URL).subscribe((response) => {
        this.progress = 100;
        setTimeout(() => {
          this.loading = false;
          this.progress = 100;
        }, 500);
        this.isResult = true;
        this.result = response;
      });
    }
  }


  onListClick(){
    this.isDetail = false;
    this.isResult = true;
  }


  async onItemClick(item){
    this.loading = true;
    this.progress = 50;
    this.lastOpenItem = item;
    const itemId = item.itemId[0];
    const itemTitle = item.title[0];
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
      this.isResult = false;
      this.isDetail = true;
    });
  }


}
