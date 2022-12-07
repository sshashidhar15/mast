/*global describe, it, after, before*/
var {make_all_bundles} = require('../routes/bundler')
var {bundler_tasks} = require('../config');

describe('Bundler', () => {
    var tmp = JSON.stringify(bundler_tasks[0]);

    before(() => bundler_tasks[0].path = 'invalid_path_to_javascript_entry_point')

    it('should handle error', done =>
        make_all_bundles(error => done(error ? undefined : 'fail'))
    )

    after(() => bundler_tasks.push(JSON.parse(tmp)))
})
