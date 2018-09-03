'use strict';

const Step = require('app/core/steps/Step');
const services = require('app/components/services');
const FieldError = require('app/components/error');
const logger = require('app/components/logger')('Init');
const RedirectRunner = require('app/core/runners/RedirectRunner');
const {get, set} = require('lodash');

module.exports = class PaymentStatus extends Step {

    runner() {
        return new RedirectRunner();
    }

    static getUrl() {
        return '/payment-status';
    }

    getContextData(req) {
        const ctx = super.getContextData(req);
        const formdata = req.session.form;
        ctx.paymentId = get(formdata, 'payment.paymentId');
        ctx.userId = req.userId;
        ctx.authToken = req.authToken;
        ctx.paymentDue = get(formdata, 'payment.total') > 0;
        ctx.regId = req.session.regId;
        ctx.sessionId = req.session.id;
        ctx.errors = req.errors;
        return ctx;
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);
        delete ctx.authToken;
        delete ctx.userId;
        delete ctx.submissionReference;
        delete ctx.regId;
        delete ctx.sessionId;
        delete ctx.errors;
        return [ctx, formdata];
    }

    isComplete(ctx, formdata) {
        return [formdata.submissionReference, 'inProgress'];
    }

  * runnerOptions(ctx, formdata) {
      const options = {};

        if (formdata.paymentPending === 'true' || formdata.paymentPending === 'unknown') {
            const serviceAuthResult = yield services.authorise();

            if (serviceAuthResult.name === 'Error') {
                options.redirect = true;
                options.url = `${this.steps.PaymentBreakdown.constructor.getUrl()}?status=failure`;
                formdata.paymentPending = 'unknown';
                return options;
            }

            const data = {
                authToken: ctx.authToken,
                serviceAuthToken: serviceAuthResult,
                userId: ctx.userId,
                paymentId: ctx.paymentId
            };

            const findPaymentResponse = yield services.findPayment(data);

            const paymentStatus = get(findPaymentResponse, 'state.status');
            set(formdata, 'payment.status', paymentStatus);
            set(formdata, 'paymentResponse', findPaymentResponse);
            options.errors = yield this.updateCcdCasePaymentStatus(ctx, formdata);
            if (paymentStatus !== 'success') {
              options.redirect = true;
              options.url = `${this.steps.PaymentBreakdown.constructor.getUrl()}?status=failure`;
            } else {
              options.redirect = false;
              formdata.paymentPending = 'false';
            }
          } else {
            options.errors = yield this.updateCcdCasePaymentStatus(ctx, formdata);
            options.redirect = false;
            set(formdata, 'payment.status', 'not_required');
      }

      return options;
    }

    * updateCcdCasePaymentStatus(ctx, formdata) {
        const submitData = {};
        Object.assign(submitData, formdata);
        let errors;
        const result = yield services.updateCcdCasePaymentStatus(submitData, ctx);
        logger.info({tags: 'Analytics'}, 'Payment status update');

        if (result.name === 'Error') {
          errors = [(FieldError('update', 'failure', this.resourcePath, ctx))];
          logger.error('Could not update payment status', result.message);
        } else {
            logger.info('Successfully updated payment status');
        }
        return errors;
    }

    handleGet(ctx) {
        return [ctx, ctx.errors];
    }
};
