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
            //var data = createLogObject(self);
            //sendToDB(data);
		location.href ="index.html";
        }, false);
    }
};


      // Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.

function drawChart() {

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([
          ['Mushrooms', 3],
          ['Onions', 1],
          ['Olives', 1],
          ['Zucchini', 1],
          ['Pepperoni', 2]
        ]);

        // Set chart options
        var options = {'title':'How Much Pizza I Ate Last Night',
                       'width':400,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
}