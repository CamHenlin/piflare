/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var csrf = require('lusca').csrf();
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');

/**
 * Globals
 */
var type = "A";

/**
 * Controllers (route handlers).
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Connect to MongoDB.
 */
/*
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
	console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});
*/
/**
 * CSRF whitelist.
 */

var csrfExclude = ['/url1', '/url2'];

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
	paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: secrets.sessionSecret//,
	//store: new MongoStore({ url: secrets.db, auto_reconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
/*app.use(function(req, res, next) {
	// CSRF protection.
	if (_.contains(csrfExclude, req.path)) return next();
	csrf(req, res, next);
});*/
app.use(function(req, res, next) {
	// Make user object available in templates.
	res.locals.user = req.user;
	next();
});
app.use(function(req, res, next) {
	// Remember original destination before login.
	var path = req.path.split('/')[1];
	if (/auth|login|logout|signup|fonts|favicon/i.test(path)) {
		return next();
	}
	req.session.returnTo = req.path;
	next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Main routes.
 */

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */

app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/steam', apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);
app.get('/api/linkedin', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getLinkedin);
app.get('/api/instagram', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getInstagram);
app.get('/api/yahoo', apiController.getYahoo);

/**
 * OAuth sign-in routes.
 */


/**
 * OAuth authorization routes for API examples.
 */

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
	res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function(req, res) {
	res.redirect('/api/tumblr');
});
app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
	res.redirect('/api/venmo');
});

app.get('/get_type', function(req, res) {
	res.write(JSON.stringify({'type' : type}));
	res.end();
}); 

app.post('/set_type', function(req, res) {
	console.log(req);
	type = req.body.type;
	res.write(req.body.type);
	res.end();
}); 

var os = require('os');
var ifaces = os.networkInterfaces();
var my_ip = "";
var nodes = [];

for (var dev in ifaces) {
	if (dev !== 'eth0') {
		continue;
	}
	var alias = 0;
	ifaces[dev].forEach(function(details) {
		if (details.family=='IPv4') {
			console.log(dev + (alias? ':' + alias: ''), details.address);
			++alias;

			my_ip = details.address;
		}
	});
}
var lan = my_ip.match(/[0-255]+\.[0-255]+\.[0-255]+./);
console.log('I will keep an eye out for other nodes at ip addresses beginning with: ' + lan + "xxx" + ":" + app.get('port'));

var http = require('http');

function findOthers() {
	
	for (var i = 1; i < 255; i++) {
		//console.log('looking for another node at: ' + lan + i + ":" + app.get('port'));
		if (lan + i === my_ip) {
			continue;
		}
		(function () {
			var my_i = i;

			var options = {
				host: lan + my_i,
				port: app.get('port'),
				path: '/get_type'
			};

			var req = http.get(options, function(res) {
				// console.log('STATUS: ' + res.statusCode);my_i
				// console.log('HEADERS: ' + JSON.stringify(res.headers));

				// Buffer the body entirely for processing as a whole.
				var bodyChunks = [];
				res.on('data', function(chunk) {
					// You can process streamed parts here...
					bodyChunks.push(chunk);
				}).on('end', function() {
					var body = Buffer.concat(bodyChunks);
					console.log('NODE OF TYPE ' + body + ' FOUND AT NODE ' + my_i);

					nodes[my_i] = body;
				});
			});

			req.on('error', function(e) {
				nodes[my_i] = null;
			});
			
		})();
		
	}
}

app.get('/get_nodes', function(req, res) {
	res.write(JSON.stringify({ 'nodes' : nodes }));
	res.end();
}); 

function confirmNodesExist() {
	for (var i = 1; i < nodes.length; i++) {
		if (nodes[i] === undefined || nodes[i] === null) {
			continue;
		}
		(function () {
			var my_i = i;

			var options = {
				host: lan + my_i,
				port: app.get('port'),
				path: '/get_type'
			};

			var req = http.get(options, function(res) {
				// console.log('STATUS: ' + res.statusCode);
				// console.log('HEADERS: ' + JSON.stringify(res.headers));

				// Buffer the body entirely for processing as a whole.
				var bodyChunks = [];
				res.on('data', function(chunk) {
					// You can process streamed parts here...
					bodyChunks.push(chunk);
				}).on('end', function() {
					var body = Buffer.concat(bodyChunks);
					if (body === nodes[i]) {
						console.log('NODE OF TYPE ' + body + ' CONFIRMED.');
					} else {
						console.log('NODE ' + my_i + ' WAS OF TYPE ' + nodes[my_i] + ' BUT IS NOW OF TYPE ' + body);
						nodes[i] = body;
					}
				});
			});

			req.on('error', function(e) {
				nodes[my_i] = null;
			});
		})();
	}
}

setInterval(function() {
	findOthers();
	//confirmNodesExist();
}, 5000);

/**
 * 500 Error Handler.
 */

app.use(errorHandler());

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;