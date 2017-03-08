import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';
import { IndicatorDataService } from './../shared/services/';
import { Indicator } from './../shared/models/indicator';
import { AppSettings } from './../shared/models/shared';
import { IndicatorDataBase } from './../../../api/models/indicator-data.base';
declare let $:any;

@Component({
  moduleId: module.id,
  selector: 'indicator-grid',
  templateUrl: 'indicator-grid.template.html'
})
export class IndicatorGridComponent implements OnInit, AfterViewInit{
@ViewChild('indicatorsTable') element: ElementRef;
  private indicatorsTableElement: HTMLElement;
  private indicatorsDataTable:any;

  public indicatorsdata: Array<IndicatorDataBase>;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public indicatorService: IndicatorDataService) { 
  }
  
  ngAfterViewInit() {
      this.indicatorsTableElement = this.element.nativeElement;
      this.indicatorsDataTable = $(this.indicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
  }

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
        this.indicatorsdata = data.indicatordata;
     });
  }

}