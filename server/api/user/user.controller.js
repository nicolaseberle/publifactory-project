'use strict'

var User = require('./user.model')
// var passport = require('passport')
var config = require('../../../config').backend
var jwt = require('jsonwebtoken')
var paging = require('../paging')
var _ = require('lodash')
const shortid = require('shortid');
var Invitation = require('../invitations/invitations.model');

var validationError = function (res, err) {
  return res.status(422).json(err)
}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  var search = _.merge(req.query.search, { role: 'user' })
  paging.listQuery(User, search, '-salt -hashedPassword', {}, req.query.page, function (err, json) {
    if (err) return res.status(500).send(err)
    res.status(200).json(json)
  })
}

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body)
  newUser.provider = 'local'
  newUser.role = 'user'
  newUser.save(function (err, user) {
    if (err) return validationError(res, err)

    var token = jwt.sign({ _id: user._id, name: user.name, role: user.role }, config.secrets.session, { expiresIn: '7d' })
    res.json({ token: token })
  })
}
/**
 * Create a guest account - a guest have to reset his password during the first connection
 */
exports.createGuest = function (req, res, next) {
  var newUser = new User(req.body)
  newUser.provider = 'local'
  newUser.role = 'guest'
  newUser.save(function (err, user) {
    if (err){
      return validationError(res, err)
    }
    var token = jwt.sign({ _id: user._id, name: user.name, role: user.role }, config.secrets.session, { expiresIn: '7d' })
    res.json({token: token })
  })
}
/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id

  User.findById(userId, function (err, user) {
    if (err) return next(err)
    if (!user) return res.sendStatus(404)
    res.json(user.profile)
  })
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) return res.status(500).send(err)
    return res.sendStatus(204)
  })
}

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id
  var oldPass = String(req.body.oldPassword)
  var newPass = String(req.body.newPassword)

  User.findById(userId, function (err, user) {
    if (err) {
      // handler error
    }
    if (user.authenticate(oldPass)) {
      user.password = newPass
      user.save(function (err) {
        if (err) return validationError(res, err)
        res.sendStatus(200)
      })
    } else {
      res.status(403).json({ message: 'Old password is not correct.' })
    }
  })
}

/**
 * Change a guest password and convert it in user // we check that the guest is on the list
 */
exports.changeGuestPassword = function (req, res, next) {
  var userId = req.params.id
  var newPass = String(req.body.password)

  User.findById(userId, function (_err, user) {
    Invitation.findOne({recieptEmail : user.email}, (err,invite)=>{
      console.log(invite)
    if (err) {
      // handler error
    }
    if (user.authenticate(invite.senderId)) {
      user.password = newPass
      user.role = 'user'
      user.roles = ['user']
      user.save(function (err) {
        if (err) return validationError(res, err)
        var token = jwt.sign({ _id: user._id, name: user.name, role: user.role }, config.secrets.session, { expiresIn: '7d' })
        res.json({ token: token })
      })
  }
})
})
}

/**
 * update user settings - firstname, lastname, field... (no password)
 */
exports.updateUser = async function (req, res, next) {
  try {
    var userId = req.params.id
    var firstname = String(req.body.firstname)
    var lastname = String(req.body.lastname)
    var field = String(req.body.field)
    console.log(firstname)

    const user = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { firstname, lastname, field } },
            { new: true })

    if (!user) return res.sendStatus(404);

    return res.status(200).json(user);
  } catch (err) {
      return next(err)
  }
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId = req.user._id
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err)
    if (!user) return res.json(401)
    res.json(user)
  })
}
