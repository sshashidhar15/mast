var words_count = (node, n, but) =>
  typeof node === 'object'
    ? Object.keys(node).reduce(
        (n, key) =>
          but(key)
            ? n
            : n + words_count(node[key], 0, but),
        n
      )
    : String(node).split(' ').length

module.exports = words_count
