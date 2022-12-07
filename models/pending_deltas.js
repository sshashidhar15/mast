const config = require('../config')
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators

function PendingDeltas (deltas) {
    this.deltas = deltas || []
}

PendingDeltas.prototype.insert = function (delta) {
    this.deltas.push(delta)
}
PendingDeltas.prototype.eject = function () {
    return this.deltas.shift()
}

module.exports = regulators.reduce(
    (pending_deltas, regulator) => {
        pending_deltas[regulator] = new PendingDeltas([])
        return pending_deltas
    },
    {}
)
