import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { NgxMasonryModule } from 'ngx-masonry';


import { AppComponent } from './app.component';
import { ModalComponent } from './modal/modal.component';
import { DetailComponent } from './detail/detail.component';
import { NoResultComponent } from './no-result/no-result.component';
import { WishListComponent } from './wish-list/wish-list.component';
import { WishListDetailComponent } from './wish-list-detail/wish-list-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    DetailComponent,
    NoResultComponent,
    WishListComponent,
    WishListDetailComponent
  ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatAutocompleteModule,
        MatInputModule,
        NgxPaginationModule,
        MatTooltipModule,
        MatDialogModule,
        MatIconModule,
        MatGridListModule,
        MdbModalModule,
        MdbCarouselModule,
        TabsModule.forRoot(),
        RoundProgressModule,
        FormsModule,
        NgxMasonryModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
