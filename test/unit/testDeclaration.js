'use strict';

const {assert} = require('chai');
const initSteps = require('app/core/initSteps');
const services = require('app/components/services');
const sinon = require('sinon');
const Declaration = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]).Declaration;

describe('declaration unit tests', () => {
    describe('invitedata tests', () => {
        let updateInviteDataStub;

        const executorsInvited = [
            {inviteId: '1'},
            {inviteId: '2'},
            {inviteId: '3'}
        ];

        beforeEach(() => {
            updateInviteDataStub = sinon.stub(services, 'updateInviteData');
        });

        afterEach(() => {
            updateInviteDataStub.restore();
        });

        it('Success - there are no Errors in the results', (done) => {
            updateInviteDataStub.returns(Promise.resolve({agreed: null}));
            Declaration.resetAgreedFlags(executorsInvited).then((results) => {
                assert.isFalse(results.some(result => result.name === 'Error'));
                done();
            })
            .catch(err => done(err));
        });

        it('Failure - there is an Error in the results', (done) => {
            updateInviteDataStub.returns(Promise.resolve(new Error('Blimey')));
            Declaration.resetAgreedFlags(executorsInvited).then((results) => {
                assert.isTrue(results.some(result => result.name === 'Error'));
                done();
            })
            .catch(err => done(err));
        });
    });
});
