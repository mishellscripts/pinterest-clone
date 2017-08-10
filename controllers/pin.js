const Pin = require('../models/Pin');
const User = require('../models/User');

/**
 * GET /
 * View all pins
 */
exports.getIndex = (req, res)=>{
  Pin.find({}, (err, pins)=>{
    res.render('pins/view', {
      title: 'Home',
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
    res.send({pins: user.pins});
  });
};

/**
 * GET /new
 * New pin page
 */
exports.getNewPin = (req, res)=>{
  res.render('pins/new');
};

/**
 * POST /new
 * Add new pin
 */
exports.postNewPin = (req, res, next)=>{
  var pin = new Pin({
		image: req.body.imageURL,
    pinner: req.user,
    description: req.body.description
  });
  pin.save(err=>{
    if (err) return next(err);
    User.findByIdAndUpdate(req.user.id, {$push: {pins: pin}}, err=>{
       if (err) return next(err);
       res.redirect('#');
    });
  });
};

/**
 * GET /delete/:pinid
 * Delete pin
 */
exports.getDeletePin = (req, res, next)=> {
  Pin.findById(req.params.pinid, (err,pin)=>{
    if (err) return next(err);
    if (req.user._id == pin.pinner._id) pin.remove().exec();
    res.redirect('/');
  })
}
