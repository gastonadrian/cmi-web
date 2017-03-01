import { Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppSettings } from './../shared/models/shared';

import { GoalService } from './../shared/services/goal-service';
import { IndicatorService } from './../shared/services/indicator-service';

//backend
import { PerspectiveApiResult } from './../../../api/models/api/perspective';
import { GoalApiResult } from './../../../api/models/api/goal';
import { IndicatorApiResult } from './../../../api/models/api/indicator';
import { GoalIndicatorApiResult } from './../../../api/models/api/goal-indicator';

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

  public goal: GoalApiResult;
  public perspectives: Array<PerspectiveApiResult>;
  
  public indicators: Array<IndicatorApiResult>;
  public indicator:IndicatorApiResult = new IndicatorApiResult();
  public quarterExpected:number = 1;
  public factor:number = 1;

  public errorMessage:string;

  public indicatorsDataTable:any;
  public goalIndicatorsDataTable:any;

  public indicatorIndex:number;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    private goalService: GoalService,
    public indicatorService: IndicatorService) { 
  }
  
  ngAfterViewInit() {
      
      this.htmlElement = this.element.nativeElement;
      this.goalIndicatorsTableElement = this.goalIndicatorsTable.nativeElement;
      this.indicatorsTableElement = this.indicatorsTable.nativeElement;
      this.goalIndicatorsDataTable = $(this.goalIndicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
      this.indicatorsDataTable =$(this.indicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
  }

  ngOnInit(){
    this.route.data
      .subscribe((data:any) => {
        this.goal = data.goal;  
        this.perspectives = data.perspectives;
        this.removeGoalIndicatorsFromSystemIndicators(data.indicators);
     });
  }

  removeGoalIndicatorsFromSystemIndicators(systemIndicators:Array<IndicatorApiResult>){
      this.indicators  = 
      systemIndicators.filter( (value:IndicatorApiResult, index:number, obj:any) => {
        return  !value.goalIds || !value.goalIds.find( (goalId:string, index:number, obj:any) => {  
          return goalId === this.goal._id;
        } );
      }  );
      
      if(this.indicatorsDataTable){
          this.refreshTables();
      }
  }

  onSubmit(){
    this.goalService.update(this.goal)
        .subscribe(
        (ok:any) => { 
          if(ok){
            this.router.navigateByUrl('/dashboard');
          }
        },
        (error:any) => {
            this.errorMessage = error;
        }
      );
  }

  refreshTables(){
      this.goalIndicatorsDataTable.destroy();
      this.indicatorsDataTable.destroy();
      this.goalIndicatorsDataTable = $(this.goalIndicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
      this.indicatorsDataTable =$(this.indicatorsTableElement).DataTable(AppSettings.DataTableConfig);    
  }

  removeFromGoal(indicatorToDelete:IndicatorApiResult):void{
    this.indicatorService.removeGoal(indicatorToDelete._id, this.goal._id)
      .subscribe(
      (ok:any) => { 
          if(ok){
            // adding to the table of available indicators
            this.indicators.push(indicatorToDelete);
            
            // removing the indicator from the list of goal indicators
            for(var j=0; j < this.goal.indicators.length; j++){
              if(this.goal.indicators[j]._id === indicatorToDelete._id){
                this.goal.indicators.splice(j, 1);
                break;
              }
            }
          }
        },
        (error:any) => {
            console.log('error', error);
        },
        () => {
            this.refreshTables();
        }
      );
  }

  assignIndicator(indicator:IndicatorApiResult):void{
    this.indicator = indicator;
  }
  saveGoalIndicator():void{
     let goalIndicator:GoalIndicatorApiResult = {
        goalId: this.goal._id,
        indicatorId: this.indicator._id,
        factor: this.factor
     } as GoalIndicatorApiResult;

     this.goalService.assignIndicator(goalIndicator)
        .subscribe(
          (ok:any) => { 
            if(ok){

              // set quarter expected
              this.indicatorService.setQuarterExpectation(this.indicator._id, {
                value: this.quarterExpected,
                date: new Date()
              }).subscribe( 
                (quarterResult:any) => {
                  if(quarterResult){
                    this.factor = 1;
                    this.quarterExpected = 1;

                    // redraw tables
                    if(this.indicator.goalIds.find((goalId:string, index:number, obj:any) => {  
                      return goalId === this.goal._id;
                    })){
                      // el indicador ya estaba en la lista de indicadores del objetivo, no hacer nada
                    }
                    else{
                      // redibujar las tablas
                      let tmpIndicator = new IndicatorApiResult();
                      tmpIndicator.title = this.indicator.title;
                      tmpIndicator._id = this.indicator._id;
                      tmpIndicator.data = {
                        title: this.indicator.data.title,
                        type: this.indicator.data.type
                      }
                      tmpIndicator.columnOperationTitle = this.indicator.columnOperationTitle;
                      tmpIndicator.goalIds = [this.goal._id];

                      this.goal.indicators.push(tmpIndicator);

                      // removing the indicator from the list of unassigned indicators
                      for(var j=0; j < this.indicators.length; j++){
                        if(this.indicators[j]._id === this.indicator._id){
                          this.indicators.splice(j, 1);
                          break;
                        }
                      }
                    }
                    this.indicator = new IndicatorApiResult();
                  }
                },
                (error:any) => {
                  this.errorMessage = error;
                },
                () => {
                  this.refreshTables();
                }
              );

            }
          },
          (error:any) => {
            this.errorMessage = error;
          }
        );
  }
}