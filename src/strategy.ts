/**
 * Module dependencies.
 */
import { OAuth2Client } from 'google-auth-library';
import { Strategy } from 'passport-strategy';
import got from 'got'

/**
 * `Strategy` constructor.
 *
 * The Google authentication strategy authenticates requests by verifying the
 * signature and fields of the token.
 *
 * Applications must supply a `verify` callback which accepts the `idToken`
 * coming from the user to be authenticated, and then calls the `done` callback
 * supplying a `parsedToken` (with all its information in visible form) and the
 * `googleId`.
 *
 * Options:
 * - `clientID` your Google application's client id (or several as Array)
 *
 * Examples:
 *
 * passport.use(new GoogleTokenStrategy({
 *     clientID: '12345.abcdefghijkl.apps.googleusercontent.com'// Specify the CLIENT_ID of the app that accesses the backend
 *    // Or, if multiple clients access the backend:
 *    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
 *   },
 *   function(parsedToken, googleId, done) {
 *     User.findOrCreate(..., function (err, user) {
 *       done(err, user);
 *     });
 *   }
 * ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
export class GoogleTokenStrategy extends Strategy {
  public name: string;
  public googleAuthClient: OAuth2Client;
  public verify: (...args: any[]) => void;
  public clientID: string;
  public passReqToCallback: boolean;
  public audience: string[];

  constructor(options: (() => void) | any, verify?: (...args: any[]) => void) {
    super();

    if (typeof options === 'function') {
      verify = options;
      options = {};
    }

    if (!verify) {
      throw new Error('GoogleVerifyTokenStrategy requires a verify function');
    }

    this.passReqToCallback = options.passReqToCallback;

    this.clientID = options.clientID;

    this.name = 'google-verify-token';
    this.googleAuthClient = new OAuth2Client(this.clientID);
    this.verify = verify;
    this.audience = options.audience ? options.audience : options.clientID;
  }

  /**
   * Internal function that handles successes/failures
   * 
   * @param {any} err 
   * @param {any?} parsedToken 
   * @param {any?} info
   */
  public done(err: any, parsedToken?: any, info?: any) {
    if (err) {
      return this.fail({ message: err.message }, 401);
    }

    if (!parsedToken) {
      return this.fail(info);
    }

    const verified = (error: any, user: any, infoOnUser: any) => {
      if (error) {
        return this.error(error);
      }
      if (!user) {
        return this.fail(infoOnUser);
      }
      this.success(user, infoOnUser);
    };

    if (parsedToken.sub) this.verify(parsedToken, parsedToken.sub, verified);
    else {
      this.verify(parsedToken, parsedToken, verified)
    }
  }

  /**
   * Authenticate request by verifying the token
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  public authenticate(req: any, options: any) {
    options = options || {};

    const accessToken = this.paramFromRequest(req, 'access_token');
    const idToken =
      this.paramFromRequest(req, 'id_token') ||
      this.getBearerToken(req.headers);

    if (idToken) this.verifyGoogleIdToken(idToken)
    else if (accessToken) this.verifyGoogleAccessToken(accessToken)
    else {
      return this.fail({ message: 'no Google authentication token provided' }, 401);
    }
  }

  /**
   * Verify signature and token fields for an id_token
   *
   * @param {String} idToken
   * @param {String} clientID
   * @api protected
   */
  public verifyGoogleIdToken(idToken: string) {
    this.googleAuthClient.verifyIdToken(
      {
        audience: this.audience,
        idToken,
      },
      (err, loginTicket) => {
        if (err) {
          this.done(null, false, { message: err.message });
        } else if (loginTicket) {
          const payload = loginTicket.getPayload();
          this.done(null, payload);
        } else {
          this.done(null, false, { message: 'No login ticket retuned' });
        }
      },
    );
  }

  /**
   * Ensure getting token info for access token is successful.
   * 
   * @param {String} accessToken
   * @api protected
   */
  public verifyGoogleAccessToken(accessToken: string) {
    this.googleAuthClient.getTokenInfo(accessToken).then((tokenInfo) => {
      if (!tokenInfo) {
        this.done(null, false, {
          message: 'invalid access token'
        })

        return
      }

      if (tokenInfo.expiry_date < Date.now()) {
        this.done(null, false, {
          message: 'access token expired'
        })

        return
      }

      // Now we have to get the userinfo from the token
      got.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`).then(userinfo => {
        this.done(null, userinfo)
      }).catch(e => {
        this.done(null, false, {
          message: 'failed to get userinfo'
        })
      })
    }).catch((e) => {
      this.done(null, false, {
        message: e.message
      })
    })
  }

  /**
   * Gets the id token value from req using name for lookup in req.body, req.query,
   * and req.params.
   * @param {express.Request} req
   * @param {string} name  the key to use to lookup id token in req.
   * @api protected
   */
  private paramFromRequest(req: any, name: string) {
    const body = req.body || {};
    const query = req.query || {};
    const params = req.params || {};
    const headers = req.headers || {};
    if (body[name]) {
      return body[name];
    }
    if (query[name]) {
      return query[name];
    }
    if (headers[name]) {
      return headers[name];
    }
    return params[name] || '';
  }

  private getBearerToken(headers: any) {
    if (headers && headers.authorization) {
      const parts = headers.authorization.split(' ');
      return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : undefined;
    }
  }
}
