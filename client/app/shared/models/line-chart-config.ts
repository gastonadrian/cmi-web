export interface LineChartConfig {
  settings: { 
    xAxisLabel: string,
    xAxisFormat: string, 
    yAxisLabel: string 
  };
  dataset: Array<{ 
      values: Array<{ x: Date, y:number }>, 
      key: string,
      color: string
     }>
}