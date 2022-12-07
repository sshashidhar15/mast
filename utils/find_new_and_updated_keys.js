function find_new_and_updated_keys (a, b, path, paths) {
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
                ? find_new_and_updated_keys(a[key], b[key], path.concat(key), paths)
                : paths.push(path.concat(key)) && paths,
        paths
    )
}

module.exports = find_new_and_updated_keys
