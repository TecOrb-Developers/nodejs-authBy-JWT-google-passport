import * as chai from 'chai';
import { Strategy } from '../src';

// tslint:disable-next-line:no-var-requires
const passport = require('chai-passport-strategy');

const chaiPassport = chai.use(passport);
const expect = chai.expect;

declare global {
  namespace Chai {
    // tslint:disable-next-line:interface-name
    interface ChaiStatic {
      passport: any;
    }
  }
}

describe('Strategy', () => {
  const verify = (parsedToken: any, googleId: any, done: (...args: any[]) => void) => {
    return done(null, { id: '1234' }, { scope: 'read' });
  };

  const mockToken = '123456790-POIHANPRI-KNJYHHKIIH';

  const strategy = new Strategy(
    {
      clientID: 'DUMMY_CLIENT_ID',
    },
    verify,
  );

  strategy.verifyGoogleIdToken = (idToken: string) => {
    const payload = { sub: 1 };
    strategy.done(null, payload);
  };

  const strategyWClientIDArray = new Strategy(
    {
      clientID: ['DUMMY_CLIENT_ID_1', 'DUMMY_CLIENT_ID_2', 'DUMMY_CLIENT_ID', 'DUMMY_CLIENT_ID_3'],
    },
    verify,
  );

  strategyWClientIDArray.verifyGoogleIdToken = (idToken: string) => {
    const payload = { sub: 1 };
    strategy.done(null, payload);
  };

  const strategyNoParsedToken = new Strategy(
    {
      clientID: 'DUMMY_CLIENT_ID',
    },
    verify,
  );

  strategyNoParsedToken.verifyGoogleIdToken = (idToken: string) => {
    strategy.done(null, false, { message: 'Error message' });
  };;

  const strategyTokenError = new Strategy(
    {
      clientID: 'DUMMY_CLIENT_ID',
    },
    verify,
  );

  strategyTokenError.verifyGoogleIdToken = (idToken: string) => {
    strategy.done({ message: 'Error message' });
  };

  it('should be named google-verify-token', () => {
    expect(strategy.name).to.equal('google-verify-token');
  });

  it('should throw if constructed without a verify callback', () => {
    expect(() => {
      const s = new Strategy({});
    }).to.throw('GoogleVerifyTokenStrategy requires a verify function');
  });

  function performValidTokenTest(strategyObject: any, reqFunction: any) {
    let user: any;
    let info: any;

    before(done => {
      chaiPassport.passport
        .use(strategyObject)
        .success((u: any, i: any) => {
          user = u;
          info = i;
          done();
        })
        .request(reqFunction)
        .authenticate();
    });

    it('should supply user', () => {
      expect(user).to.be.an('object');
      expect(user.id).to.equal('1234');
    });

    it('should supply info', () => {
      expect(info).to.be.an('object');
      expect(info.scope).to.equal('read');
    });
  }

  describe('handling a request with id_token as query parameter', () => {
    performValidTokenTest(strategy, (req: any) => {
      req.query = { id_token: mockToken };
    });
  });

  describe('handling a request with access_token as query parameter', () => {
    performValidTokenTest(strategy, (req: any) => {
      req.query = { access_token: mockToken };
    });
  });

  describe('handling a request with id_token as body parameter', () => {
    performValidTokenTest(strategy, (req: any) => {
      req.body = { id_token: mockToken };
    });
  });

  describe('handling a request with access_token as body parameter', () => {
    performValidTokenTest(strategy, (req: any) => {
      req.body = { access_token: mockToken };
    });
  });

  describe('handling a request with bearer token in authorization header', () => {
    performValidTokenTest(strategy, (req: any) => {
      req.headers = { authorization: 'Bearer ' + mockToken };
    });
  });

  describe('handling a valid request with clientID array in strategy options', () => {
    performValidTokenTest(strategyWClientIDArray, (req: any) => {
      req.body = { access_token: mockToken };
    });
  });

  // Failing tests
  function performFailTokenTest(strategyObject: any, reqFunction: any) {
    let error: any;

    before(done => {
      chaiPassport.passport
        .use(strategyObject)
        .fail((u: any) => {
          error = u;
          done();
        })
        .request(reqFunction)
        .authenticate();
    });

    it('should error object exists', () => {
      expect(error).to.be.an('object');
    });
  }

  describe('handling a request with no id token', () => {
    performFailTokenTest(strategy, (req: any) => {
      return;
    });
  });

  describe('handling a valid request with error', () => {
    performFailTokenTest(strategyTokenError, (req: any) => {
      req.body = { access_token: mockToken };
    });
  });

  describe('handling a valid request with no parsed token', () => {
    performFailTokenTest(strategyNoParsedToken, (req: any) => {
      req.body = { access_token: mockToken };
    });
  });
});
