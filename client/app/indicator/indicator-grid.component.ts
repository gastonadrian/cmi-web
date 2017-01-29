import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';
import { IndicatorService } from './../shared/services/';
import { Indicator } from './../shared/models/indicator';
import { AppSettings } from './../shared/models/shared';

declare let moment:any;
declare let $:any;

@Component({
  moduleId: module.id,
  selector: 'indicator-grid',
  templateUrl: 'indicator-grid.template.html'
})
export class IndicatorGridComponent implements OnInit, AfterViewInit{
  @ViewChild('table') element: ElementRef;
  private htmlElement: HTMLElement;

  public indicator: Indicator;
  public values:Array<{ date:string, value:number, expected?:number }>;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    public indicatorService: IndicatorService) { 
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
      this.setupTable();
  }

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
        this.indicator = data.indicator;
        this.values = data.indicator.values.map( (data:any) => {
          return {
            date: moment(new Date(data.date)).format('MMM-YY'),
            value: data.value,
            expected: data.expected
          };
        });

        this.setupTable();     
     });
  }

  setupTable(){
    if(!this.htmlElement || !this.values || !this.values.length){
      return;
    }
      $(this.htmlElement).DataTable(AppSettings.DataTableConfig);    
  }
}