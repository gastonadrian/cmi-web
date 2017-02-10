function utils(){
    var moment = require('moment');

    function getDataPeriods(){

        // 1) obtener la fecha del ultimo dato disponible 
        // feb 8

        var lastDate = new Date(),
            legendFormat = 'YYYY-MM-DD',
            currentYearStart = new Date(moment(lastDate).startOf('year')),
            currentQuarterStart = new Date(moment(lastDate).startOf('quarter')),
            currentSemesterStart = new Date(lastDate),
            currentSemester = getSemester(currentSemesterStart),
            previousYearStart = new Date(moment(currentYearStart).year()-1, 0, 1),
            previousYearEnd = new Date(moment(currentYearStart).year()-1, 11, 31),
            previousSemesterEnd = new Date(currentSemester.start),
            previousSemester;
            previousSemester = getSemester(moment(previousSemesterEnd).subtract(1, 'day')),
            previousQuarterEnd = new Date(moment(currentQuarterStart).subtract(1, 'day')),
            previousQuarterStart = new Date(moment(previousQuarterEnd).startOf('quarter')),
            secondPreviousQuarterEnd = new Date(moment(previousQuarterStart).subtract(1, 'day')),
            secondPreviousQuarterStart = new Date(moment(secondPreviousQuarterEnd).startOf('quarter')),
            thirdPreviousQuarterEnd = new Date(moment(secondPreviousQuarterStart).subtract(1, 'day')),
            thirdPreviousQuarterStart = new Date(moment(thirdPreviousQuarterEnd).startOf('quarter')),
            fourthPreviousQuarterEnd = new Date(moment(thirdPreviousQuarterStart).subtract(1, 'day')),
            fourthPreviousQuarterStart = new Date(moment(fourthPreviousQuarterEnd).startOf('quarter'));
            
        return {
            currentYear:{
                legend: `A&ntilde;o actual (${moment(currentYearStart).format(legendFormat)} a ${moment(lastDate).format(legendFormat)})`,
                start: currentYearStart,
                end: lastDate
            },
            currentQuarter:{
                legend: `Trimestre actual (${moment(currentQuarterStart).format(legendFormat)} a ${moment(lastDate).format(legendFormat)})`,
                start: currentQuarterStart,
                end: lastDate
            },
            currentSemester:{
                legend: `Semestre actual (${moment(currentSemester.start).format(legendFormat)} a ${moment(lastDate).format(legendFormat)})`,
                start: currentSemester.start,
                end: lastDate
            },
            previousYear:{
                legend: `A&ntilde;o anterior (${moment(previousYearStart).format(legendFormat)} a ${moment(previousYearEnd).format(legendFormat)})`,
                start: previousYearStart,
                end: previousYearEnd
            },
            previousSemester:{
                legend: `Semestre anterior (${moment(previousSemester.start).format(legendFormat)} a ${moment(previousSemester.end).format(legendFormat)})`,
                start: previousSemester.start,
                end: previousSemester.end
            },
            previousQuarter:{
                legend: `Trimestre anterior (${moment(previousQuarterStart).format(legendFormat)} a ${moment(previousQuarterEnd).format(legendFormat)})`,
                start: previousQuarterStart,
                end: previousQuarterEnd
            },
            secondPreviousQuarter:{
                legend: `Trimestre (${moment(secondPreviousQuarterStart).format(legendFormat)} a ${moment(secondPreviousQuarterEnd).format(legendFormat)})`,
                start: secondPreviousQuarterStart,
                end: secondPreviousQuarterEnd
            },
            thirdPreviousQuarter:{
                legend: `Trimestre (${moment(thirdPreviousQuarterStart).format(legendFormat)} a ${moment(thirdPreviousQuarterEnd).format(legendFormat)})`,
                start: thirdPreviousQuarterStart,
                end: thirdPreviousQuarterEnd
            },
            fourthPreviousQuarter:{
                legend: `Trimestre (${moment(fourthPreviousQuarterStart).format(legendFormat)} a ${moment(fourthPreviousQuarterEnd).format(legendFormat)})`,
                start: fourthPreviousQuarterStart,
                end: fourthPreviousQuarterEnd
            }
        };
    }

    function getPeriodFromParams(requestParameters){
        var to,
            from,
            periodLegend,
            dataPeriods = getDataPeriods();

        // determinando cual es el periodo de tiempo que solicitaremos
        if(requestParameters.to && requestParameters.from && moment(requestParameters.to).isValid() &&  moment(requestParameters.from).isValid()){
            to = requestParameters.to;
            from = requestParameters.from;
        } else {
            periodLegend = 'currentYear';
            to = moment(dataPeriods[periodLegend].to).format('YYYYMMDD');
            from = moment(dataPeriods[periodLegend].from).format('YYYYMMDD');
        }

        return {
            legend: periodLegend,
            to: to,
            from: from
        };
    }

    /**
     *  cada trimestre responden al anio
     *      enero-fin de marzo
     *      abril-fin de junio
     *      julio-fin de septiembre
     *      octubre-fin de diciembre
     *  cada semestre responden al anio
     *      enero- fin de junio
     *      julio- fin de diciembre
     */
    function getSemester(date){
        var copy = new Date(moment(date).startOf('quarter')),
            currentYear= moment(copy).year();

        if(moment(copy).month() == 0 || moment(copy).month() == 2){
            // first semester
            return {
                start: new Date(currentYear, 0, 1),
                end: new Date(currentYear, 5, 30)
            };
        }
        else{
            // second semester
            return {
                start: new Date(currentYear, 6, 1),
                end: new Date(currentYear, 11, 31)
            };
        }
    }
    

    return {
        getDataPeriods: getDataPeriods,
        getPeriodFromParams: getPeriodFromParams
    };

}

module.exports = utils;