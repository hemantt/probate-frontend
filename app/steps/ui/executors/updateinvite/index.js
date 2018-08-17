'use strict';
const ValidationStep = require('app/core/steps/ValidationStep');
const ExecutorsWrapper = require('app/wrappers/Executors');

class ExecutorsUpdateInvite extends ValidationStep {

    static getUrl() {
        return '/executors-update-invite';
    }

    getContextData(req) {
        const ctx = super.getContextData(req);
        const formdata = req.session.form;
        const executorsWrapper = new ExecutorsWrapper(formdata.executors);
        ctx.executorsEmailChangedList = executorsWrapper.executorsEmailChangedList();
        ctx.notifyExecutorsSuffix = ctx.executorsEmailChangedList.length > 1 ? '-multiple' : '';
        return ctx;
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);
        delete ctx.executorsEmailChanged;
        delete ctx.executorsEmailChangedList;
        delete ctx.notifyExecutorsSuffix;
        return [ctx, formdata];
    }
}

module.exports = ExecutorsUpdateInvite;
