var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');
var appId = '223ed8bf1bd003e6de3f448d30816fcd';


// The API that returns the in-email representation.
module.exports = function(req, res) {
    var term = req.query.text.trim();
    getWeather(term, req, res);
};

function getWeather(term, req, res) {
    var response;
    var city = term.split(', ')[0];
    try {
        response = sync.await(request({
            url: 'http://api.openweathermap.org/data/2.5/weather',
            qs: {
                q: city,
                appid : appId,
                mode: 'json',
                units: 'metric'
            },
            gzip: true,
            json: true,
            timeout: 10 * 1000
        }, sync.defer()));
    }
    catch (e) {
        res.status(500).send('Error')
    }
    var results = {
        temp : Math.floor(response.body.main.temp),
        city: city,
        country : term.split(',')[2].trim(),
        date : getDate(),
        icon: response.body.weather[0].icon
    }
    var html = '<div style="background:#e74c3c;width:150px;height:220px;font-family: Helvetica, Arial, sans-serif;text-align:center;"> \
    <img src="http://rageimages.s3.amazonaws.com/weather/'+ results.icon +'.png" style="width:80px;margin:10px"> \
    <div style="color:white"> \
    <h1 style="margin:0">'+ results.temp + '&#176;C</h1> \
    <h1 style="margin:0;font-size:20px;font-weight:300">'+ results.city +'</h1> \
    <h1 style="margin:0;font-size:12px;font-weight:300">'+ results.country + '<br/><br/>'+ results.date +'</h1> \
    </div> \
    </div>'

    res.json({
        body: html
    });
}

function getDate() {
    var date = new Date();
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var formatedDate = monthNames[date.getMonth()] + ' ' + leftPad(date.getDay(), 2) + ' ' + date.getFullYear() + ' | '
    + date.getHours() + ':' + leftPad(date.getMinutes(),2);
    return formatedDate;
}

function leftPad(str, length) {
    var pad = Array(length+1).join('0')
    return (pad + str).slice(-pad.length)
}
