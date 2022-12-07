var fs = require('fs');
var path = require('path');

var enDir = '1_current_language_en';
var otherDir = '2_target_language_other';
var mergeDir = '3_absent_target_in_current';

var createFolderRecursive = function (pathToCreate) {
    pathToCreate
    .split(path.sep)
    .reduce(function (currentPath, folder) {
        currentPath += folder + path.sep;
        if (!fs.existsSync(currentPath)){
            fs.mkdirSync(currentPath);
        }
        return currentPath;
    }, '');
};

var deleteFolderRecursive = function (path) {
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
};

deleteFolderRecursive(mergeDir);
createFolderRecursive(mergeDir);

var collectFilesRecursive = function (path) {
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
                    console.log("\x1b[31m%s\x1b[0m", 'ERROR: ' + curPath.replace(otherDir, 'es') + ' > ' + obj.parseError);
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
};

console.log("\x1b[33m%s\x1b[0m", 'START');

var enFiles = collectFilesRecursive(enDir);
var otherFiles = collectFilesRecursive(otherDir);

var discrepanciesCount = 0;

var doCompareRecursive = function (base, other) {
    base.forEach(function (item, index) {
        var x = 0;
        var _other;
        if (item.type === 'dir') {
            var oldDir = item.path;
            var newDir = oldDir.replace(enDir, mergeDir);
            createFolderRecursive(newDir);
            _other = other ? other[index] : null;
            var _files = _other ? _other.files : [];
            doCompareRecursive(item.files, _files);
        } else if (item.type === 'file') {
            var oldFile = item.path;
            var newFile = oldFile.replace(enDir, mergeDir);
            var content = item.content;
            var comparingResult;
            _other = other ? other[index] : null;
            if (item.parsed && _other && _other.parsed) {
                // do merge here
                comparingResult = compareContentFromBaseToOther(content, _other.content);
                discrepanciesCount += comparingResult.count;
                if (comparingResult.count) {
                    fs.writeFileSync(newFile, JSON.stringify(comparingResult.json, null, 4), 'utf8');
                }
            } else if (item.parsed) {
                // use base only
                json = content;
            } else {
                console.error('ERROR MERGE: ' + newFile);
                return;
            }
        }
    });
};

var compareContentFromBaseToOther = function (base, other) {
    var res = { 
        json: {}, 
        count: 0
    };
    var i, key, val;
    var keys = Object.keys(base);
    for (i in keys) {
        key = keys[i];
        val = base[key];
        if (val === other[key] && key !== '_') {
            res.json[key] = val;
            res.count++;
        }
    }
    return res;
};

doCompareRecursive(enFiles, otherFiles);

console.log("\x1b[33m%s\x1b[0m", 'DONE (count of finded discrepancies is: ' + discrepanciesCount + ')');



