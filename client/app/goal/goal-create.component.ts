import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppSettings } from './../shared/models/shared';

declare let $:any;

@Component({
  moduleId: module.id,
  selector: 'goal-create.component',
  templateUrl: 'goal-create.template.html',
  styles:[`.form-group .input-group{ padding-left:15px; }`]
})
export class GoalCreateComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  @ViewChild('indicatorsTable') indicatorsTable: ElementRef
  @ViewChild('goalIndicatorsTable') goalIndicatorsTable: ElementRef

  private htmlElement: HTMLElement;
  private indicatorsTableElement: HTMLElement;
  private goalIndicatorsTableElement: HTMLElement;

  constructor( 
    private route: ActivatedRoute,
    private router: Router) { 
  }
  
  ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
      this.goalIndicatorsTableElement = this.goalIndicatorsTable.nativeElement;
      this.indicatorsTableElement = this.indicatorsTable.nativeElement;
      $(this.goalIndicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
      $(this.indicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
      
  }

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {        
     });
  }
}