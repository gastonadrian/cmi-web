var options = {
    percent: 0.8,
    status: 'green',
    element: $('.box.finance .gauge')[0]
};
var finance = gauge(options);

var optionsCustomers = {
    percent: 0.73,
    status: 'green',
    element: $('.box.customers .gauge')[0]
};

var customers = gauge(optionsCustomers);

var optionsProcess = {
    percent: 0.58,
    status: 'yellow',
    element: $('.box.process .gauge')[0]
};

var process = gauge(optionsProcess);

var optionsLearning = {
    percent: 0.67,
    status: 'yellow',
    element: $('.box.learning .gauge')[0]
};

var learning = gauge(optionsLearning);