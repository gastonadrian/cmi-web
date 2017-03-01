import { IPerformance } from './../shared';
import { GoalApiResult } from './goal';
import { PerspectiveBase } from './../perspective.base';

export class PerspectiveApiResult extends PerspectiveBase{
    public goals:Array<GoalApiResult>;
    public performance?: IPerformance;
};