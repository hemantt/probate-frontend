const commonContent = require('app/resources/en/translation/common.json');
const pageUnderTest = require('app/steps/ui/executors/othername/index');
const {forEach} = require('lodash');

module.exports = function (executorsWithDifferentNameIdList) {
    const I = this;

    I.seeCurrentUrlEquals(pageUnderTest.getUrl());

    forEach(executorsWithDifferentNameIdList, executorListId => {
        I.checkOption('#executorsWithOtherNames-'+ executorListId);
    });

    I.click(commonContent.continue);
};
