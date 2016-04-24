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
    $('#mood')
        .css({
            'color': pain_ranges[val].color,
            'borderColor': pain_ranges[val].color
        })
        .attr('class', pain_ranges[val].icon);

    $('#moodDesc')

        .text(pain_ranges[val].text);
};

// Not a sustainable solution. Don't do this Ever!
var resetForm = function () {
    $('#symptomSelect')[0].options[0].selected = true;
    $('#painRange').val(0);
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
    },

    sendUpdate: function (data) {
        sendToDB(data)
            .then(function () {
                window.plugins.spinnerDialog.hide();
                navigator.notification.alert('Your data has been logged.', function () {
                    resetForm();
                }, 'Thanks!');
            }).catch(function (error) {
                window.plugins.spinnerDialog.hide();
                navigator.notification.alert('Your data has been logged.', function () {
                    resetForm();
                }, 'ERROR!');
            });
    },

    getLocation: function () {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(function (loc_data) {
                console.log(loc_data);
                resolve(loc_data);
            }, function (error) {
                reject(error);
            });
        });
    },

    createLogObject: function () {
        var symptom = $('#symptomSelect').val(),
            pain = $('#painRange').val();

        var now = new Date();

        var data = {
            symptom: symptom,
            severity: parseInt(pain, 10),
            location: this.location,
            time: now.toISOString()
        };

        return data;
    },

    receivedEvent: function (id) {
        var self = this;

        $('.js-log').on('click', function () {
            window.plugins.spinnerDialog.show(null, null, true);
            // Get Location data.
            self.getLocation()
                .then(function (loc_data) {
                    self.location = [loc_data.coords.latitude.toFixed(4), loc_data.coords.longitude.toFixed(4)];
                    var data = self.createLogObject();
                    //Get AQI data.
                    getAQI(data)
                        .then(function (resp_data) {
                            // extract all AQI values from resp_data, and get the max value.
                            data.AQI = resp_data.map(function (rec) {
                                return rec.AQI;
                            }).max();
                            // Send update with AQI.
                            self.sendUpdate(data);
                        }).catch(function () {
                            // Send update without AQI.
                            self.sendUpdate(data);
                        });
                }).catch(function (error) {
                    // Send update even if there is an error
                    // won't include location or AQI information.
                    self.sendUpdate(data);
                });
        });
    }
};
