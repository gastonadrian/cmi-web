import { BaseIndicator } from './../indicator.base';
import { ObjectID } from 'mongodb';
import { MongoIndicatorData } from "./indicator-data";
import { MongoGoalIndicator } from "./goal-indicator.mongo";
import { IndicatorPerformanceBase } from "../indicator-performance.base";

export class MongoIndicator extends BaseIndicator{
    public indicatorData?:Array<MongoIndicatorData>;
    public goalIndicators?:Array<MongoGoalIndicator>;
    public performances?:Array<IndicatorPerformanceBase>;
}

