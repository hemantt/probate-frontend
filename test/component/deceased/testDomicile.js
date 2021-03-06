const TestWrapper = require('test/util/TestWrapper'),
    DeceasedAddress = require('app/steps/ui/deceased/address/index');

describe('deceased-domicile', () => {
    let testWrapper;
    const expectedNextUrlForDeceasedAddress = DeceasedAddress.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('DeceasedDomicile');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {

        it('test right content loaded on the page', (done) => {

            testWrapper.testContent(done, []);
        });

        it('test errors message displayed for missing data', (done) => {
            const data = {};

            testWrapper.testErrors(done, data, 'required', []);

        });

        it(`test it redirects to deceased address: ${expectedNextUrlForDeceasedAddress}`, (done) => {
            const data = {
                domicile: 'England or Wales'
            };
            testWrapper.testRedirect(done, data, expectedNextUrlForDeceasedAddress);
        });

    });
});
