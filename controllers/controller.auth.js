const express = require('express');
const passport = require('passport');
const router = express.Router();
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
require('dotenv/config');
const User = require('../models/User');
require('./controller.tokenJWT');
const googleAuth = require('../routes/authentication');


const passportConfig = {
    "clientID":    process.env.GOOGLE_CLIENT_ID,
    "clientSecret": process.env.GOOGLE_CLIENT_SECRET,
    "callbackURL": "http://localhost:3000/auth/google/callback",
    "passReqToCallback"   : true
}

passport.use(User.createStrategy());

passport.use(
    new GoogleStrategy(
      passportConfig,
      function (request, accessToken, refreshToken, profile, done) {
        User.findOrCreate(
          { email: profile._json.email },
          { name: profile.displayName, email: profile._json.email},
          function (err, user) {
            return done(err, user);
          }
        );
      }
    )
);

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.serializeUser(function(user, done){
    done(null, user);
});

module.exports=router;