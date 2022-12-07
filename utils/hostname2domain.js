module.exports = hostname => {
    var chars = hostname.split('');
    var char;
    var domain = [];
    var dots = 0;
    while (chars.length) {
        char = chars.pop();
        if (char === '.') dots++;
        if (dots === 2) return '.' + domain.join('');
        domain.unshift(char)
    }
    return (hostname.includes('localhost') ? '' : '.') + domain.join('');
}
