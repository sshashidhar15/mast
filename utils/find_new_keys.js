function find_new_keys (a, b, path, paths) {
    if (typeof a === 'string') return paths

    var keys_a = Object.keys(a || {})
    var keys_b = Object.keys(b || {})

    return keys_a.reduce(
        (paths, key) =>
            keys_b.includes(key)
                ? find_new_keys(a[key], b[key], path.concat(key), paths)
                : paths.push(path.concat(key)) && paths,
        paths
    )
}

module.exports = find_new_keys
