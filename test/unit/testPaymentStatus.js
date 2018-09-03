'use strict';

const initSteps = require('app/core/initSteps');
const assert = require('chai').assert;
const co = require('co');
const services = require('app/components/services');
const sinon = require('sinon');

describe('PaymentStatus', () => {
  const steps = initSteps([__dirname + '/../../app/steps/ui/']);
  let servicesMock;

  const successfulPaymentResponse = {
    'id': '24',
    'amount': 5000,
    'state': {
      'status': 'success',
      'finished': true
    },
    'description': 'Probate Payment: 50',
    'reference': 'CODE4$$$Hill4314$$$CODE5$$$CODE2/100',
    'date_created': '2018-08-29T15:25:11.920+0000',
    '_links': {}
  };

  const failedPaymentResponse = {
    'state': {
      'status': 'failed',
      'finished': false
    }
  };

  const PaymentStatus = steps.PaymentStatus;

  beforeEach(function () {
    servicesMock = sinon.mock(services);
  });

  afterEach(function () {
    servicesMock.restore();
  });

  describe('runnerOptions', () => {

      it('should set paymentPending to unknown if there is an authorise failure', sinon.test((done) => {
        const expectedOptions = {
          redirect: true,
          url: '/payment-breakdown?status=failure'
        };
        const expectedFormData = {
          paymentPending: 'unknown'
        };
        servicesMock.expects('authorise').returns(Promise.resolve({name: 'Error'}));
        const ctx = {total: 1};
        const formData = {paymentPending: 'true'};
        co(function* () {
          const options = yield PaymentStatus.runnerOptions(ctx, formData);

          assert.deepEqual(options, expectedOptions);
          assert.deepEqual(formData, expectedFormData);

          servicesMock.expects('findPayment').never();
          servicesMock.expects('updateCcdCasePaymentStatus').never();
          done();
          }).catch(err => {
              done(err);
          });
      }));

      it('should set redirect to false, paymentPending to false and payment status to success if payment is successful', sinon.test((done) => {
        const expectedFormData = {
          'payment': {
            'status': 'success'
          },
          'paymentPending': 'false',
          'paymentResponse': successfulPaymentResponse
        };
        servicesMock.expects('authorise').returns(Promise.resolve({}));
        servicesMock.expects('findPayment').returns(Promise.resolve(successfulPaymentResponse));
        servicesMock.expects('updateCcdCasePaymentStatus').returns(Promise.resolve({}));
        const ctx = {
          authToken: 'XXXXX',
          userId: 12345,
          paymentId: 4567
        };
        const formData = {paymentPending: 'true'};
        co(function* () {
          const options = yield PaymentStatus.runnerOptions(ctx, formData);
          assert.deepEqual(options.redirect, false);
          assert.deepEqual(formData, expectedFormData);
          servicesMock.expects('findPayment').never();
          servicesMock.expects('authorise').never();
          servicesMock.expects('updateCcdCasePaymentStatus').never();
          done();
        }).catch(err => {
          done(err);
        });
      }));

    it('should set redirect to true, paymentPending to true and payment status to failure if payment is not successful', sinon.test((done) => {
      const expectedFormData = {
        'payment': {
          'status': 'failed',
        },
        'paymentPending': 'true',
        'paymentResponse': {
          'state': {
            'finished': false,
            'status': 'failed'
          }
        }
      };
      servicesMock.expects('authorise').returns(Promise.resolve({}));
      servicesMock.expects('findPayment').returns(Promise.resolve(failedPaymentResponse));
      servicesMock.expects('updateCcdCasePaymentStatus').returns(Promise.resolve({}));

      const ctx = {
        authToken: 'XXXXX',
        userId: 12345,
        paymentId: 4567
      };
      const formData = {paymentPending: 'true'};
      co(function* () {
        const options = yield PaymentStatus.runnerOptions(ctx, formData);
        assert.deepEqual(options.redirect, true);
        assert.deepEqual(formData, expectedFormData);
        servicesMock.expects('findPayment').once();
        servicesMock.expects('authorise').once();
        servicesMock.expects('updateCcdCasePaymentStatus').never();
        done();
      }).catch(err => {
        done(err);
      });
    }));

      it('should set payment status to not_required and redirect to false when paymentPending is false', sinon.test((done) => {
        const expectedFormData = {
          'payment': {
            'status': 'not_required'
          },
          'paymentPending': 'false'
        };

        servicesMock.expects('authorise').returns(Promise.resolve({}));
        servicesMock.expects('findPayment').returns(Promise.resolve({}));
        servicesMock.expects('updateCcdCasePaymentStatus').returns(Promise.resolve({}));

        const ctx = {authToken: 'XXXXX',
          userId: 12345,
          paymentId: 4567
        };

        const formData = {paymentPending: 'false'};
        co(function* () {
          const options = yield PaymentStatus.runnerOptions(ctx, formData);
          assert.deepEqual(options.redirect, false);
          assert.deepEqual(formData, expectedFormData);
          servicesMock.expects('findPayment').never();
          servicesMock.expects('authorise').once();
          servicesMock.expects('updateCcdCasePaymentStatus').never();
          done();
        }).catch(err => {
          done(err);
        });
      }));

      it('should return field error on options if updateCcdCasePaymentStatus returns error', sinon.test((done) => {
        servicesMock.expects('authorise').returns(Promise.resolve({}));
        servicesMock.expects('findPayment').returns(Promise.resolve(successfulPaymentResponse));
        servicesMock.expects('updateCcdCasePaymentStatus').returns(Promise.resolve({name: 'Error'}));

        const ctx = {authToken: 'XXXXX',
          userId: 12345,
          paymentId: 4567
        };

        const formData = {paymentPending: 'false'};
        co(function* () {
          const options = yield PaymentStatus.runnerOptions(ctx, formData);
          assert.deepEqual(options.errors, [{
            param: 'update',
            msg: {
              summary: 'We could not submit your application. Your data has been saved, please try again later.',
              message: 'payment.status.errors.update.failure.message'
            }
          }]);
          servicesMock.expects('findPayment').once();
          servicesMock.expects('authorise').once();
          servicesMock.expects('updateCcdCasePaymentStatus').once();
          done();
        }).catch(err => {
          done(err);
        });
      }));

      });

});
