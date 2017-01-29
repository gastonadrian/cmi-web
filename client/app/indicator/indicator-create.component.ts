import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';
import { IndicatorService } from './../shared/services/';
import { Indicator } from './../shared/models/indicator';

@Component({
  moduleId: module.id,
  selector: 'indicator-create',
  templateUrl: 'indicator-create.template.html'
})
export class IndicatorCreateComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
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
  }

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
     });
  }
}