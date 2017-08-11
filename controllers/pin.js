const Pin = require('../models/Pin');
const User = require('../models/User');

/**
 * GET /
 * View all pins
 */
exports.getIndex = (req, res)=>{
  Pin.find({}, (err, pins)=>{
    if (err) return next(err);
    res.render('pins/view', {
      isHomeView: true,
      pins: JSON.stringify(pins),
      isLoggedIn: req.user != null
    });
  });
};

/**
 * GET /pins/:userid
 * View user pins
 */
exports.getUserPins = (req, res, next)=>{
  User.findById(req.params.userid, (err, user)=>{
    if (err) return next(err);
    res.render('pins/view', {
      isLoggedIn: req.user != null
    });
  });
};

/**
 * GET /delete/:pinid
 * Delete pin
 */
exports.getDeletePin = (req, res, next)=> {
  console.log('deleting');
  Pin.findById(req.params.pinid, (err,pin)=>{
    if (err) return next(err);
    if (req.user._id == pin.pinner._id) pin.remove().exec();
    res.redirect('/pins/' + req.user._id);
  })
}
