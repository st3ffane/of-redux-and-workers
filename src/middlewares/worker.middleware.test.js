require("mocha");
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const mddwr = require('./worker.middleware').middleware;
const MOCK_WORKER = {
  addEventListener: sinon.fake(),
  postMessage: sinon.fake(),
  process: sinon.fake()
}
describe('Testing main worker middleware', () => {
  it('Should pass action to next', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    mddwr(MOCK_WORKER)(store)(next)({ type: 'UNKNOWN' });
    expect(store.dispatch.callCount).to.equal(0);
    expect(next.callCount).to.equal(1);
    expect(next.calledWith({ type: 'UNKNOWN' })).to.equal(true);
    done();
  })
  it('Should pass action to worker', (done) => {
    const store = {
      dispatch: sinon.fake(),
    }
    const next = sinon.fake();
    mddwr(MOCK_WORKER)(store)(next)({ type: 'WORKER!1' })
      .then(() => {
        expect(next.callCount).to.equal(1);
        expect(next.calledWith({ type: 'WORKER!1' })).to.equal(true);
        expect(MOCK_WORKER.postMessage.callCount).to.equal(1);
        done();
      });

  })
})