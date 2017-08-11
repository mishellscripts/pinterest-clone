/**
 * GET /
 * Main page - initially view all pins
 */
exports.getIndex = (req, res)=>{
  res.render('pins/view', {
    isLoggedIn: req.user != null
  });
};