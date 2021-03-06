var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

var Schema = mongoose.Schema
// var ObjectId = Schema.Types.ObjectId

var UserSchema = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  pv: {
    type: Number,
    default: 0
  },
  role: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})
UserSchema.pre('save', function (next) {
  var user = this
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) return next(err)
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err)
        user.password = hash
        next()
      })
    })
  } else {
    this.meta.updateAt = Date.now()
    next()
  }
})
UserSchema.methods = {
  comparePassword: function (_password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, this.password, function (err, isMatch) {
        if (err) reject(err)
        resolve(isMatch)
      })
    })
  }
}
UserSchema.statics = {
  fetch: (cb) => {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: (id, cb) => {
    return this
      .findOne({
        _id: id
      })
      .exec(cb)
  }
}
module.exports = UserSchema
