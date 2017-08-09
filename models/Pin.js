const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  image: {type: String, required: true},
  pinner: {type: Object, required: true},
  description: {type: String, required: true},
  likes: {type: Number, default: 0},
  repins: {type: Number, default: 0}
}, { timestamps: true });

module.exports = mongoose.model('Pin', pinSchema);
