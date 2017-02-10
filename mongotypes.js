CREATE CLASSES FOR
    semaphore
    perspective
    goal
    indicator
    goalIndicator

perspective

{
    id: 1,
    customerId: 22,
    title: 'Perspectiva Financiera',
    semaphore:{
        redUntil:30,
        yellowUntil:59
    }
}

goal 

{
    id:1,
    customerId: 22,    
    label:'Proceso de operaciones',
    perspective:3,
    semaphore:{
        redUntil:30,
        yellowUntil:59
    }
}

indicator

{
    id: 1,
    customerId: 22,
    title: '% Productos defectuosos',
    unit:{
        type: 'percentage',
        title: '%'
    },
    performanceComparison: 'lessThan'
    datasource:{
        id: 1,
        table:'LoteProductos',
        column: '% defectos',
        dateColumn: 'fecha',
        tableOperation: 'average',
        rowOperation:''
    }
}


indicator-goal

{
    indicatorId: 1,
    goalId: 1, 
    factor: 4,
    semaphore:{
        redUntil:30,
        yellowUntil:59
    }    
}

indicator-expected

{
    indicatorId: 1,
    value: 10,
    quarterStarts: '20160101',
    quarterEnds: '20160330'
}

indicator-data

{
    indicatorId: 1,
    customerId: 22,
    value: 17,
    date: '20160101'
}

{
    indicatorId: 1,
    customerId: 22,
    value: 5,
    date: '20160201'
}

{
    indicatorId: 1,
    customerId: 22,
    value: 4,
    date: '20160301'
}