function find_updated_keys (b, a, path, paths) {
    if (typeof a === 'string')
      return typeof b === 'string'
        ? a === b
            ? paths
            : paths.push(path) && paths
        : paths

    var keys_a = Object.keys(a || {})
    var keys_b = Object.keys(b || {})

    return keys_a.reduce(
        (paths, key) =>
            keys_b.includes(key)
                ? find_updated_keys(b[key], a[key], path.concat(key), paths)
                : paths,
        paths
    )
}

module.exports = find_updated_keys
