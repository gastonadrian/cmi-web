import { Goal } from './goal';
import { Performance } from './shared';

export class Perspective{
    public id:number;
    public title:string;
    public performance: Performance;
    public goals:Array<Goal>;

    constructor(){}
}