## emptygif
Empty gif for nodejs

## Usage example
	var emptygif = require('emptygif');
	var express = require('express');
	
	app.use(emptygif.emptyGif([{path:'/erreport', maxAge: 0}]))
	
	// OR
	app.get('/tracking_pixel.gif', function(req, res, next) {
		
		process.nextTick(function() {
			// do tracking stuff
		});
		
		emptygif.sendEmptyGif(req, res, {
			'Content-Type' : 'image/gif',
			'Content-Length' : emptygif.emptyGifBufferLength,
			'Cache-Control' : 'public, max-age=0' // or specify expiry to make sure it will call everytime
		});
	});

## methods

### emptyGif(configs)
* `configs` Array of objects. Each object contain path, maxAge and callback. Path can be string or RegExp. maxAge is optional, default 86400000ms. Callback is for doing something with request such as statistics. For example:

	[{path: '/img/empty.gif', maxAge : 86400000, callback: function(req) { /* view counting code */}}]
	
Returns
* `function(req, res, next)` middleware

### sendEmptyGif(req, res, headers)
* `req` Request object
* `res` Response object
* `headers` Headers associated with this image.
	
## Property
### emptyGifBufferLength
The length of the image in case it is needed for customed headers for sendEmptyGif