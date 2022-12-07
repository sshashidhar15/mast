/*global describe, it*/
var hostname2domain = require('../utils/hostname2domain');
var assert = require('assert');

describe('hostname2domain', () => {
    it('www.icmarkets.com        -> .icmarkets.com', () => assert.equal(hostname2domain('www.icmarkets.com'), '.icmarkets.com'))
    it('icmarkets.com            -> .icmarkets.com', () => assert.equal(hostname2domain('icmarkets.com'), '.icmarkets.com'))
    it('.icmarkets.com           -> .icmarkets.com', () => assert.equal(hostname2domain('.icmarkets.com'), '.icmarkets.com'))
    it('secure.icmarkets.com     -> .icmarkets.com', () => assert.equal(hostname2domain('secure.icmarkets.com'), '.icmarkets.com'))
    it('not.secure.icmarkets.com -> .icmarkets.com', () => assert.equal(hostname2domain('not.secure.icmarkets.com'), '.icmarkets.com'))
})
