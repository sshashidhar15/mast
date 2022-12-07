
var browserify = require('browserify');
var tasks = require('../config').bundler_tasks;

var bundler = {};

function bundle (path, cb) {
    var b = browserify();
    b.add(path);
    b.bundle(cb);
}

function make_all_bundles (tasks, cb) {
    if (tasks.length === 0) return cb();

    var task = tasks.pop();

    bundle(task.path, (e, source) => {
        if (e) return cb(e);
        bundler[task.name] = source.toString('utf8');
        make_all_bundles(tasks, cb);
    });
}

module.exports.make_all_bundles = cb => make_all_bundles(tasks, cb);

module.exports.middleware = (req, res, next) =>
    Object.keys(bundler).reduce(
        (acc, task_name) => {
            acc[task_name] = bundler[task_name];
            return acc;
        },
        res.locals
    ) && next()
