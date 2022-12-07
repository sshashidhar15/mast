function applyDelta(current, delta) {
  return Object.keys(delta).reduce(
    (tree, el) =>
      el.split('.').reduce(
        (sum, key, i, arr) => {
          // console.log(key, sum[key])
          if (!sum[key])
            sum[key] = arr.length === i + 1 ? '' : {}
          if (typeof sum[key] !== 'string') {

            return sum[key]
          }
          sum[key] = delta[el]
          return tree
        },
        tree
      ),
    current
  )
}

module.exports = applyDelta
