Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

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
    updateFace(0);
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

var api_key = '2E94CAB9-D695-479D-9CB1-4EDE99530CDD';

var getAQI = function (data, success, fail) {
    fail = fail || function () {};
    var url = 'http://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=' + data.location[0] + '&longitude=' + data.location[1] + '&distance=25&API_KEY=' + api_key;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

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
        navigator.geolocation.getCurrentPosition(function (data) {
            self.location = [data.coords.latitude.toFixed(4), data.coords.longitude.toFixed(4)];
        });
    },

    sendUpdate: function (data) {
        sendToDB(data, function () {
            navigator.notification.alert('Your data has been logged.', function () {
                sendToLogger(data);
                resetForm();
            }, 'Thanks!');
        }, function () {
            alert('error');
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var self = this;

        document.querySelector('.js-log').addEventListener('click', function () {
            var data = self.createLogObject(self);
            getAQI(data, function (resp_data) {
                var AQIs = resp_data.map(function (rec) {
                    return rec.AQI;
                })
                data.AQI = AQIs.max();
                self.sendUpdate(data);
            }, function () {
                self.sendUpdate(data);
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
            location: this.location,
            time: now.toISOString()
        };

        return data;
    }
};

function updateFace(val) {
    var Mood = document.getElementById('mood');
    var Desc = document.getElementById('moodDesc');
    var values = [
        {
            icon: 'icon-emo-grin',
            text: 'I\'ve never felt better'
        },
        {
            icon: 'icon-emo-happy',
            text: 'I can\'t complain'
        },
        {
            icon: 'icon-emo-displeased',
            text: 'I feel meh'
        },
        {
            icon: 'icon-emo-unhappy',
            text: 'I don\'t feel so good'
        },
        {
            icon: 'icon-emo-cry',
            text: 'I feel horrible'
        }
    ];
    Mood.className = values[val].icon;
    Desc.innerHTML = values[val].text;
};
