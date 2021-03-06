require("mocha");
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const workermddwr = require('./worker.middleware').middleware;
const workerAsPromise = require('./worker.as.promise').middleware;
const { initWorker } = require('../index');
const { PREFIX, SUCCESS, ERROR } = require('./consts');

const { createStore, applyMiddleware, combineReducers } = require('redux');
const MOCK_WORKER = {
  addEventListener: (t, cllbck) => {

  },
  postMessage: (action) => {

  },
  process: (action) => {

  }
}
describe('Worker as promise', () => {
  it('should init', () => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    mddwr({
      type: 'DO NOTHING'
    });
    expect(next.callCount).to.equal(1);
  })
  it('should start and resolve a promise worker action', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID
        resolveOn: 'STUFF_DONE'
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'STUFF_DONE',
        workerID: 1
      });
      p.then((result) => {
        expect(result.type).to.equal('STUFF_DONE');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(1);
    expect(next.calledOnceWith({ type: 'WORKER!DOSTUFF' }));

  })
  it('should start and resolve a promise worker action with default actions', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID

      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'DOSTUFF_SUCCESS',
        workerID: 1
      });
      p.then((result) => {
        expect(result.type).to.equal('DOSTUFF_SUCCESS');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(1);
    expect(next.calledOnceWith({ type: 'WORKER!DOSTUFF' }));

  })
  it('should start and resolve a promise worker action for one of possible', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {

        workerID: 1, // force ID
        resolveOn: ['STUFF_NEARLY_DONE', 'STUFF_DONE']
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'STUFF_DONE',
        workerID: 1,
      });
      p.then((result) => {
        expect(result.type).to.equal('STUFF_DONE');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(1);
    expect(next.calledOnceWith({ type: 'WORKER!DOSTUFF' }));


  })
  it('should start and reject a promise worker action', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID
        rejectOn: 'STUFF_NOT_DONE'
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'STUFF_NOT_DONE',
        workerID: 1, // force ID
      });
      p.catch((result) => {
        expect(result.type).to.equal('STUFF_NOT_DONE');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(1);
    expect(next.calledOnceWith({ type: 'WORKER!DOSTUFF' }));

  })
  it('should start and reject a promise worker action for one of possible', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID
        resolveOn: ['STUFF_NEARLY_DONE', 'STUFF_DONE'],
        rejectOn: ['BIG_CRASH', 'BIGGER_CRASH']
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'BIGGER_CRASH',
        workerID: 1, // force ID
      });
      p.catch((result) => {
        expect(result.type).to.equal('BIGGER_CRASH');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.calledOnceWith({ type: 'WORKER!DOSTUFF' }));

  })

  it('should start and reject a promise worker action for one of possible, process other dispatch in between', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID
        resolveOn: ['STUFF_NEARLY_DONE', 'STUFF_DONE'],
        rejectOn: ['BIG_CRASH', 'BIGGER_CRASH']
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'BIGGER_CRASH',
        workerID: 1, // force ID
      });
      p.catch((result) => {
        expect(result.type).to.equal('BIGGER_CRASH');
        expect(next.callCount).to.equal(3)
        done();
      })
    }, 100);
    // promise do not resolved yet
    mddwr({
      type: 'NOOP'
    });
    expect(next.calledOnceWith({ type: 'WORKER!DOSTUFF' }));
    expect(next.calledOnceWith({ type: 'NOOP' }));


  })

});
describe('Multi-concurrent process', () => {
  it('should start and resolve 2 promises worker action', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {

        workerID: 1, // force ID
        resolveOn: 'STUFF_DONE'
      }
    });
    let p2 = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {

        workerID: 2, // force ID
        resolveOn: 'STUFF_DONE'
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'STUFF_DONE',
        workerID: 1, // force ID
      });
      p.then((result) => {
        expect(result.type).to.equal('STUFF_DONE');
        expect(next.callCount).to.equal(3)
      }).then(() => {
        mddwr({
          type: 'STUFF_DONE',

          workerID: 2, // force ID
        });
        p2.then((result) => {
          expect(result.type).to.equal('STUFF_DONE');
          expect(next.callCount).to.equal(4);
          done();
        })
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(2); // call dispatch directly
    expect(next.calledWith({ type: 'WORKER!DOSTUFF' }));


  })
  it('should start and resolve 2 promises worker action bad order', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    let mddwr = workerAsPromise(store)(next);

    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {

        workerID: 1, // force ID
        resolveOn: 'STUFF_DONE'
      }
    });
    let p2 = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {

        workerID: 2, // force ID
        resolveOn: 'STUFF_DONE'
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      mddwr({
        type: 'STUFF_DONE',
        workerID: 2, // force ID
      });
      p2.then((result) => {
        expect(result.type).to.equal('STUFF_DONE');
        expect(next.callCount).to.equal(3)
      }).then(() => {
        mddwr({
          type: 'STUFF_DONE',

          workerID: 1, // force ID
        });
        p.then((result) => {
          expect(result.type).to.equal('STUFF_DONE');
          expect(next.callCount).to.equal(4);
          done();
        })
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(2); // call dispatch directly
    expect(next.calledWith({ type: 'WORKER!DOSTUFF' }));

  })
})
describe('All together...', () => {
  it('Should init', (done) => {
    // config everything
    const store = {
      dispatch: sinon.fake(),
    }

    const finalNext = sinon.fake(); // for not running in circle
    const mockWorker = workermddwr(MOCK_WORKER)(store)(finalNext);
    const next = sinon.fake((action) => mockWorker(action)); // next call worker middleware
    let mddwr = workerAsPromise(store)(next);
    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID
        resolveOn: 'STUFF_DONE'
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      // as from worker
      mddwr({
        type: 'STUFF_DONE',
        workerID: 1
      });
      p.then((result) => {
        expect(result.type).to.equal('STUFF_DONE');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(1); // call dispatch directly

  })
  it('Should init with default', (done) => {
    // config everything
    const store = {
      dispatch: sinon.fake(),
    }

    const finalNext = sinon.fake(); // for not running in circle
    const mockWorker = workermddwr(MOCK_WORKER)(store)(finalNext);
    const next = sinon.fake((action) => mockWorker(action)); // next call worker middleware
    let mddwr = workerAsPromise(store)(next);
    // dispatch a simple call
    let p = mddwr({
      type: 'WORKER!DOSTUFF',
      resolvers: {
        workerID: 1, // force ID
      }
    });

    setTimeout(() => {
      // dispatch a resolve
      // as from worker
      mddwr({
        type: 'DOSTUFF_SUCCESS',
        workerID: 1
      });
      p.then((result) => {
        expect(result.type).to.equal('DOSTUFF_SUCCESS');
        expect(next.callCount).to.equal(2)
        done();
      })
    }, 100);
    // promise do not resolved yet
    expect(next.callCount).to.equal(1); // call dispatch directly

  })
});
describe('Integration test: all together', () => {
  it('Should init with default', (done) => {
    // create a redux store with middlewares and worker like actions
    // actions
    const ACTIONS = {
      TEST: PREFIX + 'TEST',
      TEST_OK: 'TEST' + SUCCESS,
      TEST_ERROR: 'TEST' + ERROR
    }
    const app = (state = 'none', action) => {
      console.log('Reducer:', action.type, action)
      switch (action.type) {
        case ACTIONS.TEST_OK: {
          return 'Button 1: ' + action.payload;
        }
        default: return state;
      }
    }
    const reducers = combineReducers({
      'app': app
    });

    const worker = {
      postMessage: function (dt) {
        // send back a response?
        // call worker handler
        global.self.__handler({ data: dt })
      },
      addEventListener: function (type, handler) {
        this.handler = handler;
      }
    };
    // create a worker like: mock datas
    global.self = {};
    global.self.postMessage = (action) => {
      worker.handler({ data: action })
    }
    global.self.addEventListener = (t, handler) => {
      global.self.__handler = handler;
    }
    initWorker({
      [ACTIONS.TEST]: (action, dispatch) => {
        console.log('Action', action);
        return Promise.resolve('OK')
      }
    })
    const store = createStore(
      reducers,
      applyMiddleware(
        workerAsPromise, // worker as promise must be set **BEFORE** workerMiddleware!
        workermddwr(worker)),
    );
    // spy on dispatch
    sinon.spy(store, 'dispatch');

    // all is ready, dispatch an action
    store.dispatch({
      type: ACTIONS.TEST,
      payload: 'datas',
      resolvers: {}
    }).then((res) => {
      expect(res.type).to.equal(ACTIONS.TEST_OK);
      expect(res.payload).to.equal('OK')
      expect(store.dispatch.callCount).to.equal(1); // in test, response is sent before dispatching question...
      expect(store.dispatch.calledWith({ type: ACTIONS.TEST_OK, payload: 'OK' }))
      done();
    })
  })
})