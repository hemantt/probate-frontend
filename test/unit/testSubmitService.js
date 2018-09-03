/*global describe, it, before, beforeEach, after, afterEach */
'use strict';
const assert = require('chai').assert;
const nock = require('nock');
const services = require('app/components/services');
const formData = require('test/data/complete-form-multipleapplicants');
const initSteps = require('app/core/initSteps');
const config = require('app/config');
const SUBMIT_SERVICE_URL = config.services.submit.url;
const CREATE_PAYMENT_SERVICE_URL = config.services.payment.createPaymentUrl;

describe('submit service tests', function () {
  let ctx = {};
  const req = {
    session: {
      form: {}
    },
    query: {}
  };

  const steps = initSteps([__dirname + '/../../app/steps/action/', __dirname + '/../../app/steps/ui/']);

  beforeEach(function () {
    const data = formData;
    req.session.form = data;
    const sessionData = steps.PaymentStatus;
    ctx = sessionData.getContextData(req);
  });

  afterEach(function () {
    nock.cleanAll();
  });

  it('Should successfully update payment status', function (done) {
    const expectedResponse = {};
    nock(SUBMIT_SERVICE_URL).post('/updatePaymentStatus')
      .reply(200, expectedResponse);
    services.updateCcdCasePaymentStatus(formData, ctx);
    done();
  });

  it('Should successfully sent to submit service', function (done) {
    const expectedResponse = {};
    const scope = nock(SUBMIT_SERVICE_URL).post('/submit')
      .reply(200, expectedResponse);
    services.sendToSubmitService(formData, ctx);
    assert.isTrue(scope.isDone());
    done();
  });

  it('Should successfully find payment', function (done) {
    nock(`${CREATE_PAYMENT_SERVICE_URL.replace('userId', 123)}`).get('/1')
      .reply(200, {
      'state': {
        'status': 'success'
      }
    });
    formData.paymentId = 1;
    formData.userId = 123;
    services.findPayment(formData);
    done();
  });
});
