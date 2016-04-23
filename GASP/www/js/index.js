var handleRequestLoad = function (success, fail) {
    if (this.status >= 200 && this.status < 400) {
        // Success!
        var data = JSON.parse(this.response);
        success(data);
    } else {
        // We reached our target server, but it returned an error
        fail();
    }
};

// Not a sustainable solution. Don't do this Ever!
var resetForm = function () {
    document.getElementById('symptomSelect').options[0].selected = true;
    document.getElementById('painRange').value = 0;
};

var sendToDB = function (data, success, fail) {
    var url = 'http://40.83.188.181:9200/user/symptoms';
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.onload = handleRequestLoad.bind(request, success, fail);
    request.onerror = function () { fail(); };
    request.send(JSON.stringify(data));
};

var sendToLogger = function (data) {
    var url = 'http://requestb.in/1cidfkx1';
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send(JSON.stringify(data));
};

var getIPAddress = function (success, fail) {
    fail = fail || function () {};
    var request = new XMLHttpRequest();
    request.open('GET', 'http://jsonip.com/', true);

    request.onload = handleRequestLoad.bind(request, success, fail);

    request.onerror = function () {
        fail();
    };

    request.send();
};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.locaiton = [];
        this.ip = null;
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var self = this;
        this.receivedEvent('deviceready');
        getIPAddress(function (data) {
            self.ip = data.ip;
        });
        navigator.geolocation.getCurrentPosition(function (data) {
            self.location = [data.coords.latitude, data.coords.longitude];
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var self = this;

        document.querySelector('.js-log').addEventListener('click', function () {
            var data = self.createLogObject(self);

            sendToDB(data, function () {
                navigator.notification.alert('Your data has been logged.', function () {
                    sendToLogger(data);
                    resetForm();
                }, 'Thanks!');
            }, function () {
                alert('error');
            });
        }, false);

    },

    createLogObject: function () {
        var symptom = document.getElementById('symptomSelect').value,
            pain = document.getElementById('painRange').value;

        var now = new Date();

        var data = {
            symptom: symptom,
            severity: parseInt(pain, 10),
            ip: this.ip,
            location: this.location,
            time: now.toISOString()
        };

        return data;
    }
};
