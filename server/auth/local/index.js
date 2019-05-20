'use strict'

var express = require('express')
var passport = require('passport')
var auth = require('../auth.service')

var router = express.Router()

router.post('/', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info
    if (error) return res.status(401).json(error)
    if (!user) return res.status(404).json({ message: 'Something went wrong, please try again.' })

    var token = auth.signToken(user)
    res.json({ token: token })
  })(req, res, next)
})

router.post('/orcid', function (req, res, next) {
  passport.authenticate('orcid', function (err, user, info) {
    console.log("err : %s\ninfo : %s", err, info);
    const error = err || info
    if (error) return res.status(401).json(error)
    if (!user) return res.status(404).json({ message: 'Something went wrong, please try again.' })
    const token = auth.signToken(user);
    res.json({ success: true, token: token })
  })(req, res, next)
})


module.exports = router
