var util = require('util');
const emptyGifBuffer = new Buffer('R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
const emptyGifBufferLength = emptyGifBuffer.length;
const DEFAULT_MAX_AGE = 86400000;

const DEFAULT_HEADERS = {
	'Content-Type' : 'image/gif',
	'Content-Length' : emptyGifBufferLength,
	'Cache-Control' : 'public, max-age=' + (DEFAULT_MAX_AGE / 1000)
};

function sendEmptyGif(req, res, headers) {
	if (headers) {
		if (!headers.hasOwnProperty('Content-Type')) {
			headers['Content-Type'] = DEFAULT_HEADERS['Content-Type'];
		}
		if (!headers.hasOwnProperty('Content-Length')) {
			headers['Content-Length'] = DEFAULT_HEADERS['Content-Length'];
		}
		if (!headers.hasOwnProperty('Cache-Control')) {
			headers['Cache-Control'] = DEFAULT_HEADERS['Cache-Control'];
		}
	} else {
		headers = DEFAULT_HEADERS;
	}
	res.writeHead(200, headers);
	res.end(emptyGifBuffer);
}

function throwWithExample() {
	throw new Error("configs must be an array, for instance: [{path: '/img/empty.gif', maxAge : 86400000}]");
}

function emptyGif(configs) {
	/* An site may need multiple emptygif depending on expiry dates */
	var configs = configs || [{
		path : '/img/empty.gif',
		maxAge : DEFAULT_MAX_AGE
	}];
	var i, len, regex;

	// sanity check
	if(!util.isArray(configs)) {
		throwWithExample();
	}

	len = configs.length;

	for( i = 0; i < len; i++) {
		if(!configs[i].hasOwnProperty('path')) {
			throwWithExample();
		}
		if(!configs[i].hasOwnProperty('maxAge')) {
			configs[i].maxAge = DEFAULT_MAX_AGE;
		}

		if (util.isRegExp(configs[i].path)) {
			regex = configs[i].path;
		} else {
			regex = new RegExp('^' + configs[i].path);
		}

		configs[i].regex = regex;
	}

	return function(req, res, next) {
		var i;
		for( i = 0; i < len; i++) {
			if(configs[i].regex.test(req.url)) {

				sendEmptyGif(req, res, {
					'Content-Type' : 'image/gif',
					'Content-Length' : emptyGifBufferLength,
					'Cache-Control' : 'public, max-age=' + (configs[i].maxAge / 1000)
				});

				if (configs[i].callback) {
					configs[i].callback(req);
				}
				return;
			}
		}
		next();
	};
}

module.exports = {
	emptyGifBufferLength : emptyGifBufferLength, // customed headers
	emptyGif : emptyGif, // middleware
	sendEmptyGif : sendEmptyGif // send emptygif manually

}
