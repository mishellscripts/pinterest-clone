const Pin = require('../models/Pin');
const User = require('../models/User');

/**
 * GET /
 * View all pins
 */
exports.getIndex = (req, res)=>{
  res.render('pins/view', {
    isLoggedIn: req.user != null
  });
};