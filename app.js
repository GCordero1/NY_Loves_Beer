var BREWERY_API_KEY = 'c0bfe1046bca5568424c1cc7d09ee817';
var GOOGLE_API_KEY = 'AIzaSyAvl_MgYvxKe5hC9wsgBijZaiuzTXletbY';
var SPOT_INFO = [];
var SELECTED_SPOT = {latitude: 0, longitude:0};
var BREWERY_INFO = [];
var RADIUS = 3;

//gets brewery information by location from the brewerydDB website using
//the latitude and longitude of the selected spot
var findBreweries = function() {
	//resets BREWERY_INFO in case user changes their mind
	BREWERY_INFO = [];
	//had to use cors-anywhere proxy to get around CORS restriction
	$.ajax({
		url: 'https://cors-anywhere.herokuapp.com' + 
		'/http://api.brewerydb.com/v2/search/geo/point?lat=' +
		SELECTED_SPOT.latitude + '&lng=' + SELECTED_SPOT.longitude + 
		'&radius=' + RADIUS +
		'&key=' + BREWERY_API_KEY, 
		success: function(data) {
			//stores the data in BREWERY_INFO
			//try-catch in case no breweries found in this radius
			try{
				BREWERY_INFO = data.data.map(function(item) {
					return item;
				});
				//calls function that creates map
				$('#map_canvas').removeClass('hidden');
				initMap();
			}
			catch(e) {
				$('#map_canvas').html("<p>Sorry, we didn't find any beer near here.</p>" +
					"<p>Don't be salty, fancy beer is hard to find!</p>" +
					"<a id='try-again' class='light-blue' href='#'>Click here to try again with a bigger search radius.</a>");
				$('#map_canvas').removeClass('hidden');
				$('#results_container').html("<p>Sorry, we didn't find any beer near here.</p>");
			}
		},
	});
};

//retries AJAX request with bigger search radius
$('#map_canvas').on('click', '#try-again', function(event) {
	RADIUS += 5;
	console.log('radius is now: ' + RADIUS);
	findBreweries();
});

//creates a map using Google Map API
function initMap() {
	var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };
                    
    //displays a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);
        
    //creates an array to hold params for map markers
    var markers = BREWERY_INFO.map(function(item) {
    	return [item.brewery.name, item.latitude, item.longitude];
    });
                        
    //creates html for info windows for map markers
    var infoWindowContent = BREWERY_INFO.map(function(item) {
    	return ['<div class="info_content">' +
        '<h3 class="black-text">' + (item.brewery.name || '') + '</h3>' +
        '<p class="black-text">' + (item.streetAddress || '') + '</p>' +
        '<p class="black-text">' + (item.locality || '') + ', ' + (item.region || '') + ' ' + (item.postalCode || '') + '</p>' +
        '<p class="black-text">' + (item.phone || '') + '</p>' +
        '<p class="black-text">' + (item.hoursOfOperation || '') + '</p>' +
        '<p><a id="try-again" class="light-blue" href="' + (item.website || 'http://www.brewerydb.com/brewery/' + item.brewery.id) + 
        '">' + (item.website || 'http://www.brewerydb.com/brewery/' + item.brewery.id) + '</a></p>' +
    	'</div>'];
    });
        
    //displays multiple markers on the map
    var infoWindow = new google.maps.InfoWindow(), marker, i;
    
    //loops through the array of markers & places each one on the map  
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0],
            icon: {
    			url: 'beer.png',
				scaledSize: new google.maps.Size(30, 30)
			}
        });
        
        //allows each marker to have an info window    
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(map, marker);
            };
        })(marker, i));

        //automatically centers the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    //adds brewery info as a list below the map
    $('#results_container').html(infoWindowContent.join('<hr>'));
    $('#results_container p,h3').removeClass('black-text');
}