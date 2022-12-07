var fs = require('fs');
var path = require('path');

var enDir = '1_current_language_en';
var otherDir = '2_target_language_other';
var mergeDir = '3_merged_target_on_current';

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
                    console.log("\x1b[31m%s\x1b[0m", 'ERROR: invalid JSON content ' + curPath.replace(otherDir, 'vi') + '');
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

function check_same_tree_file_structure (a, b) {
    if (a.length !== b.length) return 'Different count of files in folders: ' + (a.path || enDir) + ' <-> ' + (b.path || otherDir);
    for (var i = 0; i < a.length; i++) {
        if (a[i].path.replace(enDir, '') !== b[i].path.replace(otherDir, '')) return 'Different dir structure at: ' + a[i].path + ' <-> ' + b[i].path;
        if (a[i].files && b[i].files) {
            var error = check_same_tree_file_structure(a[i].files, b[i].files);
            if (error) return error;
        } else if (a[i].files || b[i].files) return 'One is folder, but another is file.'
    }
    return null
}

var doMergeRecursive = function (base, other) {
    base.forEach(function (item, index) {
        var x = 0;
        var _other;
        if (item.type === 'dir') {
            var oldDir = item.path;
            var newDir = oldDir.replace(enDir, mergeDir);
            createFolderRecursive(newDir);
            _other = other ? other[index] : null;
            var _files = _other ? _other.files : [];
            doMergeRecursive(item.files, _files);
        } else if (item.type === 'file') {
            var oldFile = item.path;
            var newFile = oldFile.replace(enDir, mergeDir);
            var content = item.content;
            var json = content;
            _other = other ? other[index] : null;
            if (item.parsed && _other && _other.parsed) {
                // do merge here
                json = mergeContentToBaseFromOther(content, _other.content);
            } else if (item.parsed) {
                // use base only
                json = content;
            } else {
                console.error('ERROR MERGE: ' + newFile);
                return;
            }
            fs.writeFileSync(newFile, JSON.stringify(json, null, 4), { encoding: 'utf8'});
        }
    });
};

var createTheSameObject = function (orig) {
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
};

var mergeContentToBaseFromOther = function (base, other) {
    var res = createTheSameObject(base);
    var i, key, val;
    var keys = Object.keys(other);
    for (i in keys) {
        key = keys[i];
        val = other[key];
        if (res[key]) {
            res[key] = val;
        }
    }
    return res;
};

var dir_struct_error = check_same_tree_file_structure(enFiles, otherFiles)
if (dir_struct_error) {
    console.log("\x1b[31m%s\x1b[0m", dir_struct_error);
    process.exit(1);
}

doMergeRecursive(enFiles, otherFiles);

console.log("\x1b[33m%s\x1b[0m", 'DONE');
