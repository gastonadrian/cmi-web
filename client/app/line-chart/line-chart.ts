import { Component, Input, ElementRef, AfterViewInit, ViewChild,  OnChanges } from '@angular/core';
import { LineChartConfig } from '../shared/models/line-chart-config';

declare let d3:any;
declare let moment:any;
declare let nv:any;

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.template.html',
  styleUrls:['./line-chart.css']
})
export class LineChartComponent implements OnChanges, AfterViewInit {

    @Input() config: LineChartConfig;
    @ViewChild('container') element: ElementRef;

    private host:any;
    private chart:any;
    private htmlElement: HTMLElement;
    
    /**
     * We request angular for the element reference 
    * and then we create a D3 Wrapper for our host element
    **/
    constructor() {}
    
    ngAfterViewInit() {
        this.htmlElement = this.element.nativeElement;
        this.host = d3.select(this.htmlElement).select('svg');

        if(this.config){
            nv.addGraph(this.buildSVG.bind(this));                
        }
    }
    
    /**
     * Everythime the @Input is updated, we rebuild the chart
    **/
    ngOnChanges(changes: any): void {
        if (!this.config || !this.host){
            return;
        }
        this.config.settings = {
            xAxisFormat: this.config.settings.xAxisFormat || 'MMM',
            xAxisLabel: this.config.settings.xAxisLabel || 'x',
            yAxisLabel: this.config.settings.yAxisLabel || 'y'
        };
        nv.addGraph(this.buildSVG.bind(this));                        
    }

    /**
     * We can now build our SVG element using the configurations we created
    **/
    private buildSVG(): any {
        this.chart = nv.models.lineChart()
                    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                    .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                    // .transitionDuration(350)  //how fast do you want the lines to transition?
                    .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                    .showYAxis(true)        //Show the y-axis
                    .showXAxis(true);        //Show the x-axis
        
    
        this.chart.xAxis     //Chart x-axis settings
            .axisLabel(this.config.settings.xAxisLabel)
            .tickFormat( (t:any) => moment(t).format(this.config.settings.xAxisFormat).toUpperCase());
    
        this.chart.yAxis     //Chart y-axis settings
            .axisLabel(this.config.settings.yAxisLabel)
            .tickFormat(d3.format('.02f'));
                
        this.host            
            .datum(this.config.dataset)         //Populate the <svg> element with chart data...
            .call(this.chart);          //Finally, render the chart!
    
        //Update the chart when window resizes.
        nv.utils.windowResize(this.chart.update);
        return this.chart;
    }
}