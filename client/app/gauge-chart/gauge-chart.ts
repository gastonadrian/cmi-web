import { Component, Input, ElementRef, AfterViewInit, ViewChild,  OnChanges } from '@angular/core';
import { GaugeChartConfig } from '../shared/models/gauge-chart-config';

declare let d3:any;

@Component({
  selector: 'gauge-chart',
  templateUrl: './gauge-chart.template.html'
})
export class GaugeChartComponent implements OnChanges, AfterViewInit {

    @Input() config: GaugeChartConfig;
    @ViewChild('container') element: ElementRef;

    private host:any;
    private chart:any;

    private padRad:number;
    private barWidth:number; 
    private chartInset:number; 
    private height:number;
    private margin:any;
    private numSections:number; 
    private percent:number;
    private radius:number;
    private radiusNeedle:number;
    private totalPercent:number;
    private width:number;
    private len:number;
    private arc1:any;
    private arc2:any;
    
    /**
     * We request angular for the element reference 
    * and then we create a D3 Wrapper for our host element
    **/
    constructor() {}
    
    ngAfterViewInit() {
        this.host = d3.select(this.element.nativeElement);
        // console.log('after view init');
        this.setup();
        this.buildSVG();
        
        if(this.config.percent){
          this.render();
        }
    }
    
    /**
     * Everythime the @Input is updated, we rebuild the chart
    **/
    ngOnChanges(changes: any): void {
      console.log(this.config.percent);
        if (!this.config.percent || !this.host){
            return;
        }
        this.render();
    }

    private setup(){
      // this.percent = this.config.settings.percent || .65;
  
      this.numSections = 1;
      this.padRad = 0.025;
      this.chartInset = 10;
  
      // Orientation of gauge:
      this.totalPercent = .75;
      
      this.margin = {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20
      };

      this.width = this.host[0][0].offsetWidth - this.margin.left - this.margin.right;
      this.height = this.width;
      this.radius = Math.min(this.width, this.height) / 2;
      this.barWidth = 40 * this.width / 300; 

      this.len = this.width / 3;
      this.radiusNeedle = this.len / 6;      
    }

    private buildSVG():any{
      // console.log('buildSVG', this.config);
      // Create SVG element
      let svg:any = this.host.append('svg').attr('width', this.width + this.margin.left + this.margin.right).attr('height', this.height*0.5 + this.margin.top + this.margin.bottom);
      
      // Add layer for the panel
      this.chart = svg.append('g').attr('transform', "translate(" + ((this.width + this.margin.left) / 2) + ", " + ((this.height + this.margin.top) / 2) + ")");
      this.chart.append('path').attr('class', 'arc chart-filled ' + this.config.status);
      this.chart.append('path').attr('class', "arc chart-empty");
      
      this.arc2 = d3.svg.arc().outerRadius(this.radius - this.chartInset).innerRadius(this.radius - this.chartInset - this.barWidth);
      this.arc1 = d3.svg.arc().outerRadius(this.radius - this.chartInset).innerRadius(this.radius - this.chartInset - this.barWidth);      

      this.chart.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radiusNeedle);
      return this.chart.append('path').attr('class', 'needle').attr('d', this.recalcPointerPos(0));
    }

    private render(){
      let self:any = this;
      let oldValue:number = this.config.percent || 0;
      // console.log('oldvalue', oldValue);

      // Reset pointer position
      this.chart.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function() {
        return function(percentOfPercent:any) {
          var progress = (1 - percentOfPercent) * oldValue;
          
          self.repaintGauge(progress);
          return d3.select(this).attr('d', self.recalcPointerPos(progress));
        };
      });

      this.chart.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function() {
        return function(percentOfPercent:any) {
          var progress = percentOfPercent * self.config.percent;
          
          self.repaintGauge(progress);
          return d3.select(this).attr('d', self.recalcPointerPos(progress));
        };
      });

      return this;
    }
    /** 
      * Helper function that returns the `d` value
      * for moving the needle
    **/
    private recalcPointerPos(perc:number):any {
      let centerX: any; 
      let centerY: any; 
      let leftX: any;
      let leftY: any;
      let rightX: any;
      let rightY: any;
      let thetaRad: any;
      let topX: any;
      let topY: any;
      thetaRad = this.percToRad(perc / 2);
      centerX = 0;
      centerY = 0;
      topX = centerX - this.len * Math.cos(thetaRad);
      topY = centerY - this.len * Math.sin(thetaRad);
      leftX = centerX - this.radiusNeedle * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radiusNeedle * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radiusNeedle * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radiusNeedle * Math.sin(thetaRad + Math.PI / 2);
      // console.log('recalcPointerPos: ' + perc ,"M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY);
      return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };

    private repaintGauge() {
      let next_start:number = this.totalPercent;
      let arcStartRad:number = this.percToRad(next_start);
      let arcEndRad:number = arcStartRad + this.percToRad(this.config.percent / 2);
      // console.log('arcEndRad', arcEndRad);
      next_start += this.config.percent / 2;
  
  
      this.arc1.startAngle(arcStartRad).endAngle(arcEndRad);
  
      arcStartRad = this.percToRad(next_start);
      arcEndRad = arcStartRad + this.percToRad((1 - this.config.percent) / 2);
  
      this.arc2.startAngle(arcStartRad + this.padRad).endAngle(arcEndRad);
  
  
      this.chart.select(".chart-filled").attr('d', this.arc1);
      this.chart.select(".chart-empty").attr('d', this.arc2);
  
    }    

    /*
      Utility methods 
    */
    private percToDeg(perc:number):number {
      return perc * 360;
    }
    
    private percToRad(perc:number):number {
      return this.degToRad(this.percToDeg(perc));
    }
    
    private degToRad(deg:number):number {
      return deg * Math.PI / 180;
    }

}
