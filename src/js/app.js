/*global ko google oauthSignature Offline*/
"use strict";

// Yelp Constants
var yelpKeyData = {
	consumerKey: 'F5APQyb0l7Em1n9zaVUNsQ',
	consumerSecret: '3dYrzpG46RBg4uk_uLuHyUwi1rI',
	token: 'EsMVBbm6XcJsvvAjbqPec7Fm6oibxnK9',
	tokenSecret: 'cZ57WmK7BvKmk-Irq6dFanfnqjA'
};

var locationData = [{
	name: 'Toshi Sushi',
	yelpID: 'toshi-sushi-los-angeles-2',
	address: '359 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.049600,
		lng: -118.239411
	}
}, {
	name: 'Mr Ramen',
	yelpID: 'mr-ramen-los-angeles',
	address: '341 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.049768,
		lng: -118.239631
	}
}, {
	name: 'Sushi Enya',
	yelpID: 'sushi-enya-los-angeles',
	address: '343 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.049763,
		lng: -118.239568
	}
}, {
	name: 'Suehiro Cafe',
	yelpID: 'suehiro-cafe-los-angeles',
	address: '337 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.049890,
		lng: -118.239750
	}
}, {
	name: 'Monzo',
	yelpID: 'marugame-monzo-los-angeles-2',
	address: '329 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.050031,
		lng: -118.239965
	}
}, {
	name: 'Daikokuya',
	yelpID: 'daikokuya-los-angeles',
	address: '327 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.050070,
		lng: -118.240020
	}
}, {
	name: 'Korea BBQ House',
	yelpID: 'korean-bbq-house-los-angeles',
	address: '323 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.050108,
		lng: -118.240107
	}
}, {
	name: 'Manichi Ramen',
	yelpID: 'manichi-ramen-los-angeles',
	address: '321 1/2 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.050144,
		lng: -118.240135
	}
}, {
	name: 'Sansuitei',
	yelpID: 'san-sui-tei-los-angeles',
	address: '313 E 1st St Los Angeles, CA 90012',
	location: {
		lat: 34.050297,
		lng: -118.240397
	}
}, {
	name: 'JiST cafe',
	yelpID: 'jist-cafe-los-angeles',
	address: '116 Judge John Aiso St Los Angeles, CA 90012',
	location: {
		lat: 34.050771,
		lng: -118.240376
	}
}];

var MapViewModel = function() {
	var self = this;
	
	self.yelpRequest = function(yelpID, marker) {
		// generate random string for oauth_nonce
		var generateNonce = function() {
		    var text = "";
		    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		    for(var i = 0; i < 20; i++) {
		        text += characters.charAt(Math.floor(Math.random() * characters.length));
		    }
		    return text;
		};
	    
	    var yelpFullURL = 'http://api.yelp.com/v2/business/' + yelpID;
	    
	    var yelpParameters = {
	    	oauth_consumer_key: yelpKeyData.consumerKey,
	    	oauth_token: yelpKeyData.token,
	    	oauth_nonce: generateNonce(),
	    	oauth_timestamp: Math.floor(Date.now()/1000),
	    	oauth_signature_method: 'HMAC-SHA1',
	    	oauth_version: '1.0',
	    	callback: 'cb'
	    };
	    
	    var encodedSignature = oauthSignature.generate('GET', yelpFullURL, yelpParameters, yelpKeyData.consumerSecret, yelpKeyData.tokenSecret);
	    yelpParameters.oauth_signature = encodedSignature;
	    
	    var settings = {
	    	url: yelpFullURL,
	    	data: yelpParameters,
	    	cache: true,
	    	dataType: 'jsonp',
	    	timeout: 7000,
	    	success: function (result, status, jq) {
				self.jsonGET(result, marker);
	    	},
	    	error: function (jq, status, error) {
	    		console.log("There is an error getting Yelp information. Will attempt to get Yelp information again.");
	    		self.jsonGETFailed(marker);
	    		self.yelpRequest(yelpID, marker);
	    	}
	   };
	    
	   $.ajax(settings);
	};
	self.center = new google.maps.LatLng(34.050275, -118.239985);
	
	self.init = function() {
		var myOptions = {
			disableDefaultUI : true,
			zoom: 19,
			center: self.center,
		};
		// Create a new google maps object and attaching it to the DOM with id='map-canvas'
		self.map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
		
		self.markers = ko.observableArray([]);
		// Creates a marker and pushes into self.markers array
		$.each(locationData, function(key, data) {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(data.location.lat, data.location.lng),
				map: self.map,
				listVisible: ko.observable(true),
				animation: google.maps.Animation.DROP,
				name: data.name,
				address: data.address
			});
			// send AJAX request to get data
			self.yelpRequest(data.yelpID, marker);
			
			// Bind a infowindow object and animation for marker
			var contentString = '<div><h1>'+ data.name + '</h1><p>' + data.address + '</p></div>';
			self.infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function() {
				self.map.panTo(marker.getPosition());
				// Make marker icon bounce only once
				marker.setAnimation(google.maps.Animation.BOUNCE);
    			setTimeout(function(){ marker.setAnimation(null); }, 750);
				self.infowindow.setContent(contentString);
			    self.infowindow.open(self.map, this);
			});
			
			self.markers.push(marker);
		});
		google.maps.event.addListener(self.infowindow,'closeclick', function() {
			self.resetCenter();
		});
	};
	
	self.setCurrentRestuarant = function(marker) {
		google.maps.event.trigger(marker, 'click');
	};
	
	// Once data is successful update
	self.jsonGET = function(data, markerToUpdate) {
		var contentString = '<div><h1>'+ markerToUpdate.name + '</h1><p>' + markerToUpdate.address + '</p><p> Rating: ' + data.rating +' | # of Reviews: '+ data.review_count + '</p><img src="'+ data.rating_img_url + '"></img></div>';
		self.infowindow = new google.maps.InfoWindow();
		google.maps.event.addListener(markerToUpdate, 'click', function() {
			self.infowindow.setContent(contentString);
		    self.infowindow.open(self.map, this);
		});
	};
	
	// Once data is unsuccessful tell user 
	self.jsonGETFailed = function(markerToUpdate) {
		var contentString = '<div><h1>'+ markerToUpdate.name + '</h1><p>' + markerToUpdate.address + '</p><p> Rating: ERROR | # of Reviews: ERROR</p><p>Resending Request</p>></div>';
		self.infowindow = new google.maps.InfoWindow();
		google.maps.event.addListener(markerToUpdate, 'click', function() {
			self.infowindow.setContent(contentString);
		    self.infowindow.open(self.map, this);
		});
	};
	
	self.resetCenter = function() {
		self.map.panTo(self.center);
	};
	
	self.locationListIsOpen = ko.observable(true);
	
	self.toggleLocationListIsOpen = function() {
		self.locationListIsOpen(!self.locationListIsOpen());
	};
	
	self.toggleLocationListIsOpenButtonText = ko.computed( function() {
    	return self.locationListIsOpen() ? "hide" : "show";
    });
    
    self.toggleLocationListIsOpenStatus = ko.computed( function() {
    	return self.locationListIsOpen() ? true : false;
    });
	
	self.filterWord = ko.observable("");
	self.filterWordSearch = ko.computed( function() {
    	return self.filterWord().toLowerCase().split(' ');
    });
    
    self.filterSubmit = function() {
    	self.filterWordSearch().forEach(function(word) {
    		self.markers().forEach(function(marker) {
    			var name = marker.name.toLowerCase();
    			var address = marker.address.toLowerCase();
    			((name.indexOf(word) === -1) && (address.indexOf(word) === -1)) ? marker.setMap(null) : marker.setMap(self.map);
    			((name.indexOf(word) === -1) && (address.indexOf(word) === -1)) ? marker.listVisible(false) : marker.listVisible(true);
    		});
    	});
    	self.filterWord("");
    };
    
	self.init();
};

$(ko.applyBindings(new MapViewModel()));

// Checks the internet status every 7 seconds
var run = function(){
 if (Offline.state === 'up')
 Offline.check();
 };
$(setInterval(run, 7000));
