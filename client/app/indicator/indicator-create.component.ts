import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IndicatorService } from './../shared/services/';

// Backend imports
import { 
  BackendAppSettings,
  Operations,
  IDataDefinition,
  PerformanceComparisons
     } from './../../../api/models/shared';
import { IndicatorApiResult } from './../../../api/models/api/indicator';

@Component({
  moduleId: module.id,
  selector: 'indicator-create',
  templateUrl: 'indicator-create.template.html'
})
export class IndicatorCreateComponent implements OnInit, AfterViewInit{
  @ViewChild('container') element: ElementRef;
  private htmlElement: HTMLElement;

  public indicator: IndicatorApiResult;

  public dataTypes:Array<IDataDefinition> = BackendAppSettings.dataTypes;
  public submitted: Boolean = false;

  public operation:number;
  public comparison:number;

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
  
    //TODO: Prepare this for edition
    this.indicator = new IndicatorApiResult();
  }
  
  onSubmit() { 
    this.submitted = true; 
    this.indicator.datasource = {
      _id:'',
      table:'',
      columnOperation: +(this.operation as number),
      rowOperation:'',
      dateColumn:'',
      valueColumn:''
    };
    this.indicator.performanceComparison = +(this.comparison as number);
    console.log(this.indicator);

    return this.indicatorService.save(this.indicator)
      
      .subscribe(
        (data:any) => { 
        },
        (error:any) => {
            console.log('error', error);
        },
        () =>{
            this.router.navigateByUrl('/dashboard');
        }
      );
  }
  get diagnostic() { 
    return JSON.stringify(this.indicator); 
  }
}