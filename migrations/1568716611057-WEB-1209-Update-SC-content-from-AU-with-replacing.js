var redis = require('../redis');
var msgpack = require('msgpack-lite');
var prefix = 'Migration WEB-1209-Update-SC-content-from-AU-with-replacing ';

function deep_replace (tree) {
    Object.keys(tree).forEach(function (key) {
        if (typeof tree[key] === 'string') {
            if (tree[key].indexOf('IC Markets') !== -1) {
                tree[key] = tree[key].replace(/IC Markets/gi, 'IC Markets (SC)');
                if (tree[key].indexOf('(SC) (SC)') !== -1) {
                    tree[key] = tree[key].replace(/(SC) (SC)/gi, '(SC)');
                }
            }
            return;
        }
        return deep_replace(tree[key]);
    });
}

module.exports.up = function (next) {
    console.info(prefix + 'up');
    redis(function (_, db) {
        return new Promise(function (y, n) {return db.hgetall(redis.CURRENT.asic, function (e, _) {return e ? n(e) : y(_);});})
            .then(function asic2fsa (asic) {
                var langs = Object.keys(asic);
                langs.forEach(function (lang) {
                    asic[lang] = msgpack.decode(asic[lang]);
                    deep_replace(asic[lang]);
                    asic[lang] = msgpack.encode(asic[lang]);
                });
                return asic;
            })
            .then(function save_fsa (fsa) {
                console.info(prefix + 'save FSA translations patch to Redis!');
                return new Promise(function (y, n) {return db.hmset(redis.CURRENT.fsa, fsa, function (e) {return e ? n(e) : y();});});
            })
            .then(function done () {
                console.info(prefix + ' up done');
                next();
            })
            .catch(function (e) {
                console.error(prefix + ' up fail with error: ' + JSON.stringify(e));
                process.exit(1);
            });
    });
};

module.exports.down = function (next) {
    return next();
};
