var assert = require('assert');
var emptygif = require('../')

/* simple mock */
var request = function(url) {
	this.url = url;
};

var response = function() {
	this.status = null;
	this.headers = null;
	this.content = null;
};

var emptyGifBuffer = new Buffer(
		'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
		'base64')

response.prototype = {
	writeHead : function(status, headers) {
		this.status = status;
		this.headers = headers;
	},
	end : function(content) {
		this.content = content;
	}
}

describe("Calling sendEmptyGif", function() {
	describe('with no headers', function() {
		var req = new request('/emptygif.gif');
		var res = new response();
		emptygif.sendEmptyGif(req, res);

		it('sent status 200', function() {
			assert.equal(res.status, 200);
		});

		it('sent default headers', function() {
			assert.deepEqual(res.headers, {
				'Content-Type' : 'image/gif',
				'Content-Length' : 43,
				'Cache-Control' : 'public, max-age=86400'
			})
		});
	});

	describe('with customized headers', function() {
		var expected = {
			'Content-Type' : 'image/gif',
			'Content-Length' : 43,
			'Cache-Control' : 'public, max-age=0'
		};
		var req = new request('/emptygif.gif');
		var res = new response();
		emptygif.sendEmptyGif(req, res, expected);

		it('sent status 200', function() {
			assert.equal(res.status, 200);
		});

		it('sent expected headers', function() {
			assert.deepEqual(res.headers, expected)
		});

		it('sent expected content', function() {
			assert.equal(String(res.content), String(emptyGifBuffer))
		});
	});

	describe('with only Cache-Control headers', function() {
		var expected = {
			'Content-Type' : 'image/gif',
			'Content-Length' : 43,
			'Cache-Control' : 'public, max-age=0'
		};
		var req = new request('/emptygif.gif');
		var res = new response();
		emptygif.sendEmptyGif(req, res, {
			'Cache-Control' : 'public, max-age=0'
		});

		it('sent status 200', function() {
			assert.equal(res.status, 200);
		});

		it('sent expected headers', function() {
			assert.deepEqual(res.headers, expected)
		});

		it('sent expected content', function() {
			assert.equal(String(res.content), String(emptyGifBuffer))
		});
	});

	describe('with additional headers', function() {
		var expected = {
			'Content-Type' : 'image/gif',
			'Content-Length' : 43,
			'Cache-Control' : 'public, max-age=86400',
			'X-user-ab' : 1
		};
		var req = new request('/emptygif.gif');
		var res = new response();
		emptygif.sendEmptyGif(req, res, {
			'X-user-ab' : 1
		});

		it('sent status 200', function() {
			assert.equal(res.status, 200);
		});

		it('sent expected headers', function() {
			assert.deepEqual(res.headers, expected)
		});

		it('sent expected content', function() {
			assert.equal(String(res.content), String(emptyGifBuffer))
		});
	});
});

describe("Middleware handler with wrong config", function() {
	it('should throw an error when calling with not array', function() {
		assert.throws(function() {
			emptygif.emptyGif({
				path : '/img/empty.gif',
				maxAge : 0
			})
		}, Error);
	});
	
	it('should throw an error when calling with no path', function() {
		assert.throws(function() {
			emptygif.emptyGif([{
				maxAge : 0
			}])
		}, Error);
	});
});

describe("Middleware handler with config for path /img/empty.gif", function() {

	middleware = emptygif.emptyGif([ {
		path : '/img/empty.gif',
		maxAge : 0
	} ])

	describe('with request to /img/empty.gif', function() {
		var req = new request('/img/empty.gif');
		var res = new response();
		middleware(req, res);

		it('sent status 200', function() {
			assert.equal(res.status, 200);
		});

		it('sent expected headers', function() {
			assert.deepEqual(res.headers, {
				'Content-Type' : 'image/gif',
				'Content-Length' : 43,
				'Cache-Control' : 'public, max-age=0'
			})
		});

		it('sent expected content', function() {
			assert.equal(String(res.content), String(emptyGifBuffer))
		});
	});

	describe('with request to /img/empty2.gif', function() {
		var req = new request('/img/empty2.gif');
		var res = new response();
		var called = false;
		middleware(req, res, function() {
			called = true;
		});

		it('should not modify res', function() {
			assert.deepEqual(res, new response());
		});

		it('should call the next handler', function() {
			assert.equal(called, true);
		});
	});
});

describe("Middleware handler with config callback", function() {
	describe('with request to /img/empty2.gif', function() {
		var called = false;
		middleware = emptygif.emptyGif([ {
			path : '/img/empty.gif',
			maxAge : 0,
			callback : function() {
				called = true;
			}
		}, {
			path : '/img/empty2.gif',
			maxAge : 0
		} ]);

		var req = new request('/img/empty2.gif');
		var res = new response();
		middleware(req, res);

		it('sent expected headers', function() {
			assert.deepEqual(res.headers, {
				'Content-Type' : 'image/gif',
				'Content-Length' : 43,
				'Cache-Control' : 'public, max-age=0'
			})
		});

		it('sent expected content', function() {
			assert.equal(String(res.content), String(emptyGifBuffer))
		});

		it('callback should not be called', function() {
			assert.equal(called, false);
		});
	});

	describe('with request to /img/empty.gif', function() {
		var called = false;
		middleware = emptygif.emptyGif([ {
			path : '/img/empty.gif',
			maxAge : 0,
			callback : function() {
				called = true;
			}
		}, {
			path : '/img/empty2.gif',
			maxAge : 0
		} ]);
		var req = new request('/img/empty.gif');
		var res = new response();
		middleware(req, res);

		it('sent status 200', function() {
			assert.equal(res.status, 200);
		});

		it('sent expected headers', function() {
			assert.deepEqual(res.headers, {
				'Content-Type' : 'image/gif',
				'Content-Length' : 43,
				'Cache-Control' : 'public, max-age=0'
			})
		});

		it('sent expected content', function() {
			assert.equal(String(res.content), String(emptyGifBuffer))
		});

		it('callback should be called', function() {
			assert.equal(called, true);
		});
	});

});