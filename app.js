/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Models
 */
const Pin = require('./models/Pin');
const User = require('./models/User');

/**
 * Controllers (route handlers).
 */
const userController = require('./controllers/user');
const pinController = require('./controllers/pin');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

/**
 * Server settings
 */

io.on('connection', socket=> {
  console.log('connected');

  socket.on('createPin', pin=> {
    var pin = new Pin(pin);
    pin.save(err=> {
      if (err) return err;
    })
  });

  socket.on('removePin', pin=> {
    Pin.findByIdAndRemove(pin._id, err=> {
      if (err) return err;
    });         
  });

  socket.on('getPinsByUser', userID=> {
    Pin.find({'pinner._id': userID}, (err, pins)=> {
      if (err) return err;
      socket.emit('getPins', pins);
    });
  })

  socket.on('getAllPins', ()=>{
    Pin.find({}, (err, pins)=> {
      socket.emit('getPins', pins);
    });
  });

  socket.on('incLike', data=> {
    Pin.findById(data.pin._id, (err, pin)=>{
      if (err) return err;
      pin.likes += 1;
      pin.likers.push(data.user._id);
      pin.save(err=>{
        if (err) return err;
      });
    });
  });

  socket.on('decLike', data=> {
    Pin.findById(data.pin._id, (err, pin)=>{
      if (err) return err;
      pin.likes -= 1;
      const index = pin.likers.indexOf(data.user._id);
      pin.likers.splice(index, 1);
      pin.save(err=>{
        if (err) return err;
      });
    });
  });

  Pin.find({}, (err, pins)=> {
    socket.emit('getPins', pins);
  });
});

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', pinController.getIndex);
app.get('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.post('/signup', userController.postSignup);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
server.listen(app.get('port'));

module.exports = app;
