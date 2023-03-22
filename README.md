# passport-google-verify-token



[Passport](http://passportjs.org/) strategy for authenticating with [Google](http://www.google.com/)
access tokens using the OAuth 2.0 API.

This module lets you authenticate using Google in your Node.js applications.
By plugging into Passport, Google authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

    $ npm install passport-google-verify-token

## Usage

### Configure Strategy

The Google authentication strategy leverages the [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs) to authenticates users. 
Applications must supply a `verify` callback which accepts the `idToken` or `access_token`
coming from the user to be authenticated, and then calls the `done` callback
supplying a `parsedToken` (with all its information in visible form) and the
`googleId`.

```js
var GoogleTokenStrategy = require("passport-google-verify-token").Strategy;

passport.use(new GoogleTokenStrategy({
      clientID: '12345.abcdefghijkl.apps.googleusercontent.com'// Specify the CLIENT_ID of the backend
     // If other clients (such as android / ios apps) also access the google api:
     // audience: [CLIENT_ID_FOR_THE_BACKEND, CLIENT_ID_ANDROID, CLIENT_ID_IOS, CLIENT_ID_SPA]
    },
    function(parsedToken, googleId, done) {
      User.findOrCreate(..., function (err, user) {
        done(err, user);
      });
    }
  ));
```
When verifying an idToken, the Google Auth library `verifyIdToken()` function is called, and the authentication is finished. When an `access_token` is passed, however, two steps have to be made:
1. The Google Auth `getTokenInfo()` function is called. This is to verify that the token is valid and not expired.
2. A request to `/oauth2/v3/userinfo` is sent. `access_token`s require this second step in order to get the same user information `idToken`s return. 

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'google-verify-token'` strategy, to authenticate requests.

```js
app.post('/auth/google/token',
  passport.authenticate('google-verify-token'),
  function (req, res) {
    // do something with req.user
    res.send(req.user? 200 : 401);
  }
);
```



```javascript
// api/controllers/AuthController.js
module.exports = {
  facebook: function(req, res) {
    passport.authenticate('google-verify-token', function(error, user, info) {
      // do stuff with user
      res.ok();
    })(req, res);
  }
};
```

### Client Requests

Clients can send requests to routes that use google-verify-token authentication using query parms, body, or HTTP headers. Clients will need to transmit the `access_token` or the `id_token` that are received from Google after user logs in.

#### Sending access_token as a Query parameter

```
GET /auth/google/token?access_token=<TOKEN_HERE>
```

#### Sending access token as an HTTP header

Clients can choose to send the access token using the Oauth2 Bearer token (RFC 6750) compliant format

```
GET /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer base64_access_token_string
```


#### Sending access token as an HTTP body

Clients can transmit the access token via the body

```
POST /resource HTTP/1.1
Host: server.example.com

access_token=base64_access_token_string
```
  

