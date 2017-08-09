const Pin = require('../models/Pin');

/**
 * GET /new
 * New pin page
 */
exports.getNewPin = (req, res) => {
  res.render('new');
};