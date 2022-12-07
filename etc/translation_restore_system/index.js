var fs = require('fs');
var path = require('path');

var enDirLatest = '1_latest_language_en';
var otherDirLatest = '2_latest_language_other';
var enDirOldest = '3_oldest_language_en';
var otherDirOldest = '4_oldest_language_other';
var restoreDir = '5_restored_oldest_to_latest';
var oldest_enKeys = 0;
var oldest_translatedKeys = 0;
var latest_enKeys = 0;
var latest_translatedKeys = 0;

function createFolderRecursive (pathToCreate) {
    pathToCreate
    .split(path.sep)
    .reduce(function (currentPath, folder) {
        currentPath += folder + path.sep;
        if (!fs.existsSync(currentPath)){
            fs.mkdirSync(currentPath);
        }
        return currentPath;
    }, '');
}

function deleteFolderRecursive (path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index){
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

function collectFilesRecursive (path) {
    var files = [];
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index){
            var curPath = path + "/" + file;
            var obj = {
                path: curPath
            };
			if (fs.lstatSync(curPath).isDirectory()) {
				obj.type = 'dir';
                obj.files = collectFilesRecursive(curPath);
                files.push(obj);
			} else {
                obj.type = 'file';
                var raw = fs.readFileSync(curPath, 'utf8').toString('utf8').replace(/^\uFEFF/, '');
                var parsed = null;
                try {
                    parsed = JSON.parse(raw);
                } catch (e) {
                    obj.raw = raw;
                    obj.parseError = e.message;

                    parsed = null;
                    console.log("\x1b[31m%s\x1b[0m", 'ERROR: invalid JSON content ' + curPath);
                }
                if (parsed) {
                    obj.content = parsed;
                    obj.parsed = !!parsed;
                }
                files.push(obj);
			}
		});
    }
    // console.log("\x1b[33m%s\x1b[0m", 'Success [' + path + ']');
    return files;
}

function doRestoreRecursive (base, other, translation) {
    base.forEach(function (item, index) {
        var x = 0;
        var _other;
        if (item.type === 'dir') {
            var oldDir = item.path;
            var newDir = oldDir.replace(enDirLatest, restoreDir);
            createFolderRecursive(newDir);
            _other = other ? other[index] : null;
            var _files = _other ? _other.files : [];
            doRestoreRecursive(item.files, _files, translation);
        } else if (item.type === 'file') {
            var oldFile = item.path;
            var newFile = oldFile.replace(enDirLatest, restoreDir);
            var content = item.content;
            var json = content;
            _other = other ? other[index] : null;
            if (item.parsed && _other && _other.parsed) {
                // do merge here
                json = mergeContentToBaseFromOther(content, _other.content, translation);
            } else if (item.parsed) {
                // use base only
                json = content;
            } else {
                console.error('ERROR MERGE: ' + newFile);
                return;
            }
            fs.writeFileSync(newFile, JSON.stringify(json, null, 4), 'utf8');
        }
    });
}

function get_KeyAsEn_ValAsOtherTranslation (base, other) {
    var plainJson = {};

    var addKeysToCollection = function (collectionJson, addJson) {
        var json = createTheSameObject(collectionJson);
        var i, key, val;
        var keys = Object.keys(addJson);
        for (i in keys) {
            key = keys[i];
            val = addJson[key];
            if (!json[key]) {
                json[key] = [];
            }
            json[key] = json[key].concat(val);
        }
    
        return json;
    };

    var collectOnlyPopulars = function (hash) {
        var result = {};
        var keys, i, key, arr;
        keys = Object.keys(hash);
        for (i in keys) {
            key = keys[i];
            arr = hash[key];
            if (result[key]) {
                // should be absent
                console.log("ERROR: skipped duplicate key 2 [" + key + "]: value [" + val + "]");
            } else {
                result[key] = getPopularValue(arr);
            }
        }
        return result;
    };

    var getPopularValue = function (arr) {
        return arr.reduce(
            function (acc, i) {
                acc.h[i] = acc.h[i] || 0;
                acc.h[i] += 1;
                if (acc.max.freq <= acc.h[i]) acc.max = {i: i, freq: acc.h[i]};
                return acc;
            },
            {
                h: {},
                max: {
                    i: null,
                    freq: 0
                }
            }
        ).max.i;
    };

    var collect_KeyAsBaseValue_ValueAsOtherValue = function (b, o) {
        var result = {};
        var keys, i, key, val, trim_key;

        keys = Object.keys(b);
        for (i in keys) {
            key = keys[i];
            oldest_enKeys++;
            if (o[key] && o[key] != b[key]) {
                oldest_translatedKeys++;
                val = o[key];
                trim_key = b[key].trim(); // remove spaces before and after
                if (result[trim_key]) {
                    result[trim_key].push(val);
                } else if (trim_key && trim_key.length) {
                    result[trim_key] = [];
                    result[trim_key].push(val);
                }
            } else {
                // console.log("ERROR: absent key in other [" + key + "]");
            }
        }

        return result;
    };

    var getKeysRecursive = function (b, o) {
        b.forEach(function (item, index) {
            var x = 0;
            var _other;
            if (item.type === 'dir') {
                var oldDir = item.path;
                _other = o ? o[index] : null;
                var _files = _other ? _other.files : [];
                getKeysRecursive(item.files, _files);
            } else if (item.type === 'file') {
                var oldFile = item.path;
                var content = item.content;
                var json = content;
                _other = o ? o[index] : null;
                if (item.parsed && _other && _other.parsed) {
                    // do merge here
                    json = collect_KeyAsBaseValue_ValueAsOtherValue(content, _other.content);
                    plainJson = addKeysToCollection(plainJson, json);
                } else if (item.parsed) {
                    // use base only
                    json = content;
                } else {
                    console.error('ERROR MERGE: ' + newFile);
                    return;
                }
                // fs.writeFileSync(newFile, JSON.stringify(json, null, 4), 'utf8');
            }
        });
    };

    getKeysRecursive(base, other);
    plainJson = collectOnlyPopulars(plainJson);
    return plainJson;
}

function createTheSameObject (orig) {
    var res = {};
    var i, key, val;
    var keys = Object.keys(orig);
    for (i in keys) {
        key = keys[i];
        val = orig[key];
        if (orig.hasOwnProperty(key)) {
            res[key] = val;
        }
    }
    return res;
}

function mergeContentToBaseFromOther (base, other, translation) {
    var res = createTheSameObject(base);
    var i, key, val;
    var keys = Object.keys(other);
    for (i in keys) {
        key = keys[i];
        val = other[key];
        latest_enKeys++;
        if (res[key]) {
            if (translation[res[key]]) {
                res[key] = translation[res[key]];
                latest_translatedKeys++;
            } else {
                res[key] = val;
            }
        }
    }
    return res;
}

// Start restoring process
console.log("\x1b[33m%s\x1b[0m", 'START RESTORING PROCESS');
// prepare
deleteFolderRecursive(restoreDir);
createFolderRecursive(restoreDir);
// collect
var enFilesLatest = collectFilesRecursive(enDirLatest);
var otherFilesLatest = collectFilesRecursive(otherDirLatest);
var enFilesOldest = collectFilesRecursive(enDirOldest);
var otherFilesOldest = collectFilesRecursive(otherDirOldest);
// detect
var oldestKeys = get_KeyAsEn_ValAsOtherTranslation(enFilesOldest, otherFilesOldest);
// restore
doRestoreRecursive(enFilesLatest, otherFilesLatest, oldestKeys);
// statistics
console.log("Oldest EN Keys: " + oldest_enKeys);
console.log("Translated Oldest Keys: " + oldest_translatedKeys);
console.log("Latest EN Keys: " + latest_enKeys);
console.log("Translated Latest Keys: " + latest_translatedKeys);

//console.log("plain oldest hash", oldestKeys);

console.log("\x1b[33m%s\x1b[0m", 'DONE');
