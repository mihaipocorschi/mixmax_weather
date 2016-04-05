var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The Type Ahead API.
module.exports = function(req, res) {
    var term = req.query.text.trim();
    if (!term) {
        res.json([{
            title: '<i>(enter a search term)</i>',
            text: ''
        }]);
        return;
    }

    var response;
    try {
        response = sync.await(request({
            url: 'https://api.prestaging.teleport.ee/api/cities/',
            qs: {
                search: term,
                limit: 5
            },
            json : true
        }, sync.defer()));
    }
    catch (e) {
        res.status(500).send('Error');
        return;
    }

    if (response.statusCode !== 200 || !response.body) {
        res.status(500).send('Error');
        return;
    }

    var results = _.chain(response.body._embedded['city:search-results'])
    .map(function(city){
        return {
            title: '<p>' + city.matching_full_name + '</p>',
            text: city.matching_full_name
        }
    })
    .value();

    if (results.length === 0) {
        res.json([{
            title: '<i>(no results)</i>',
            text: ''
        }]);
    }
    else {
        res.json(results);
    }
};
