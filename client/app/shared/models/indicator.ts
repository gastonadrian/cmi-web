import { DateValue } from './shared';
import { GoalIndicator } from './goal';

export class Indicator{
    public id:number;
    public title:string;
    public values?: Array<DateValue>;
    public goals?: Array<GoalIndicator>;
    public unit:string;
    public operation:string;
    public comparison:string;

    constructor(){

    }
}