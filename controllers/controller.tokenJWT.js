const JwtStrategy = require( 'passport-jwt' ).Strategy;
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv/config');


passport.use(
  "jwt_strategy",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.jwt_secret_key,
      
    },
    (payload, done) => {
      User.findById(payload.id, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});