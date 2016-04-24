// Add Array.max to Array.prototype.
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

var pain_ranges = [
    {
        icon: 'icon-emo-grin',
        text: 'I\'ve never felt better',
	color: '#00CC00'
    },
    {
        icon: 'icon-emo-happy',
        text: 'I can\'t complain',
	color: '#33CC99'
    },
    {
        icon: 'icon-emo-displeased',
        text: 'I feel meh',
	color: '#006699'
    },
    {
        icon: 'icon-emo-unhappy',
        text: 'I don\'t feel so good',
	color: '#FF9900'
    },
    {
        icon: 'icon-emo-cry',
        text: 'I feel horrible',
	color: '#FF0000'
    }
];

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

var updateFace = function (val) {
    var Mood = document.getElementById('mood');
    var Desc = document.getElementById('moodDesc');

    Mood.className = pain_ranges[val].icon;
    Desc.innerHTML = pain_ranges[val].text;
	Mood.style.color = pain_ranges[val].color;
	Mood.style.borderColor = pain_ranges[val].color;
};

// Not a sustainable solution. Don't do this Ever!
var resetForm = function () {
    document.getElementById('symptomSelect').options[0].selected = true;
    document.getElementById('painRange').value = 0;
    updateFace(0);
};

var sendToDB = function (data, success, fail) {
    var url = 'http://40.83.188.181:9200/user/symptoms';
    return axios.post(url, data, {
        headers: {'Content-Type': 'application/json; charset=UTF-8'}
    });
};

var api_key = '2E94CAB9-D695-479D-9CB1-4EDE99530CDD';

var getAQI = function (data) {
    var url = 'http://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=' + data.location[0] + '&longitude=' + data.location[1] + '&distance=25&API_KEY=' + api_key;
    return axios.get(url);
};

var app = {

    initialize: function () {
        this.bindEvents();
        this.locaiton = [];
        this.ip = null;
    },

    bindEvents: function () {
        $(document).on('deviceready', this.onDeviceReady.bind(this));
    },

    onDeviceReady: function () {
        var self = this;
        this.receivedEvent('deviceready');
        navigator.geolocation.getCurrentPosition(function (data) {
            self.location = [data.coords.latitude.toFixed(4), data.coords.longitude.toFixed(4)];
        });
    },

    sendUpdate: function (data) {
        sendToDB(data)
            .then(function () {
                navigator.notification.alert('Your data has been logged.', function () {
                    resetForm();
                }, 'Thanks!');
            }).catch(function () {
                alert('error');
            });
    },

    receivedEvent: function (id) {
        var self = this;

        $('.js-log').on('click', function () {
            var data = self.createLogObject(self);

            getAQI(data)
                .then(function (resp_data) {
                    var AQIs = resp_data.map(function (rec) {
                        return rec.AQI;
                    });
                    data.AQI = AQIs.max();
                    self.sendUpdate(data);
                }).catch(function () {
                    self.sendUpdate(data);
                });

        });

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
