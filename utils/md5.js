//https://github.com/roryrjb/md5-file
var crypto = require('crypto');
var fs = require('fs');

var BUFFER_SIZE = 8192;

function md5 (filename) {
    var fd = fs.openSync(filename, 'r');
    var hash = crypto.createHash('md5');
    var buffer = Buffer.alloc(BUFFER_SIZE);

    try {
        var bytesRead

        do {
            bytesRead = fs.readSync(fd, buffer, 0, BUFFER_SIZE);
            hash.update(buffer.slice(0, bytesRead));
        } while (bytesRead === BUFFER_SIZE);
    } finally {
        fs.closeSync(fd);
    }

    return hash.digest('hex');
}

module.exports = md5;
