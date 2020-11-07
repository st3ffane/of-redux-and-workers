require('mocha');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const initWorker = require('./index').default;

global.self = {
  addEventListener: function (type, cllbck) {
    this.cllbck = cllbck;
  },
  testMessage: function (data) {
    this.cllbck(data);
  },
  postMessage: sinon.fake(),
}
describe('Testing worker init', () => {

  it('Should create a worker', () => {
    let handlers = {};
    initWorker(handlers);
    // try positing something?
    global.self.testMessage({
      data: { type: 'TYPE' }
    })
  });
  it('Should create a worker and post a redux-like message', (done) => {
    global.self.postMessage = (dt) => {
      expect(dt.type).to.equal('TYPE_SUCCESS');
      expect(dt.payload).to.equal('hello')
      done();
    }
    let handlers = {
      'WORKER!TYPE': (event, cllbck) => {
        return Promise.resolve('hello');
      }
    };
    initWorker(handlers);
    // try positing something?
    global.self.testMessage({
      data: {
        type: 'WORKER!TYPE'
      }
    })
  });
  it('Should create a worker and post a redux-like message with resolvers', (done) => {
    global.self.postMessage = (dt) => {
      expect(dt.type).to.equal('TYPE_OK');
      expect(dt.payload).to.equal('hello')
      done();
    }
    let handlers = {
      'WORKER!TYPE': (event, cllbck) => {
        return Promise.resolve('hello');
      }
    };
    initWorker(handlers);
    // try positing something?
    global.self.testMessage({
      data: {
        type: 'WORKER!TYPE',
        resolvers: {
          resolveOn: 'TYPE_OK',
          rejectOn: 'TYPE_PAS_OK'
        }
      }
    })
  });
  it('Should create a worker and post a redux-like message with resolvers array', (done) => {
    global.self.postMessage = (dt) => {
      expect(dt.type).to.equal('TYPE_OK');
      expect(dt.payload).to.equal('hello')
      done();
    }
    let handlers = {
      'WORKER!TYPE': (event, cllbck) => {
        return Promise.resolve('hello');
      }
    };
    initWorker(handlers);
    // try positing something?
    global.self.testMessage({
      data: {
        type: 'WORKER!TYPE',
        resolvers: {
          resolveOn: ['TYPE_OK', 'TYPE_PAS_MAL_AUSSI_MAIS_BON...'],
          rejectOn: 'TYPE_PAS_OK'
        }
      }
    })
  });
  it('Should create a worker and post a redux-like message complete', (done) => {
    global.self.postMessage = (dt) => {
      expect(dt.type).to.equal('A_CUSTOM_TYPE');
      expect(dt.payload).to.equal('a custom type')
      done();
    }
    let handlers = {
      'WORKER!TYPE': (event, cllbck) => {
        return Promise.resolve({
          type: "A_CUSTOM_TYPE",
          payload: 'a custom type'
        });
      }
    };
    initWorker(handlers);
    // try positing something?
    global.self.testMessage({
      data: {
        type: 'WORKER!TYPE',
        resolvers: {
          resolveOn: 'TYPE_OK',
          rejectOn: 'TYPE_PAS_OK'
        }
      }
    })
  });
  it('Should create a worker and post a redux-like message and reject', (done) => {
    global.self.postMessage = (dt) => {
      expect(dt.type).to.equal('TYPE_ERROR');
      expect(dt.payload).to.equal('hello')
      done();
    }
    let handlers = {
      'WORKER!TYPE': (event, cllbck) => {
        return Promise.reject('hello');
      }
    };
    initWorker(handlers);
    // try positing something?
    global.self.testMessage({
      data: {
        type: 'WORKER!TYPE'
      }
    })
  });
})