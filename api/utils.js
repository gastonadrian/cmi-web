module.exports = function utils(){
    var moment = require('moment');
    function getDataPeriods(){

        // 1) obtener la fecha del ultimo dato disponible 
        // feb 8
        var lastDate = new Date(),
            legendFormat = 'YYYY-MM-DD',
            currentYearStart = new Date(moment(lastDate).startOf('year').toISOString()),
            currentQuarterStart = new Date(moment(lastDate).startOf('quarter').toISOString()),
            currentSemesterStart = new Date(lastDate),
            currentSemester = getSemester(currentSemesterStart),
            previousYearStart = new Date(moment(currentYearStart).year()-1, 0, 1),
            previousYearEnd = new Date(moment(currentYearStart).year()-1, 11, 31),
            previousSemesterEnd = new Date(currentSemester.start),
            previousSemester = getSemester(moment(previousSemesterEnd).subtract(1, 'day')),
            previousQuarterEnd = new Date(moment(currentQuarterStart).subtract(1, 'day').toISOString()),
            previousQuarterStart = new Date(moment(previousQuarterEnd).startOf('quarter').toISOString()),
            secondPreviousQuarterEnd = new Date(moment(previousQuarterStart).subtract(1, 'day').toISOString()),
            secondPreviousQuarterStart = new Date(moment(secondPreviousQuarterEnd).startOf('quarter').toISOString()),
            thirdPreviousQuarterEnd = new Date(moment(secondPreviousQuarterStart).subtract(1, 'day').toISOString()),
            thirdPreviousQuarterStart = new Date(moment(thirdPreviousQuarterEnd).startOf('quarter').toISOString()),
            fourthPreviousQuarterEnd = new Date(moment(thirdPreviousQuarterStart).subtract(1, 'day').toISOString()),
            fourthPreviousQuarterStart = new Date(moment(fourthPreviousQuarterEnd).startOf('quarter').toISOString());
            
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

    function getPeriodFromParams(from, to){
        var periodLegend,
            dataPeriods = getDataPeriods();

        // determinando cual es el periodo de tiempo que solicitaremos
        if(!(to && from  && moment(to).isValid() && moment(from).isValid())) {
            periodLegend = 'currentYear';
            to = moment(dataPeriods[periodLegend].end).format('YYYYMMDD');
            from = moment(dataPeriods[periodLegend].start).format('YYYYMMDD');
        }

        to = new Date(moment(to).toISOString());
        from = new Date(moment(from).toISOString());

        return {
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
    function  getSemester(date){
        var copy = new Date(moment(date).startOf('quarter').toISOString()),
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

    function getConnString(  ) {
        return `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
    }

    return {
        getDataPeriods: getDataPeriods,
        getPeriodFromParams: getPeriodFromParams,
        getConnString: getConnString
    };

}()
