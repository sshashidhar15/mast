function get_leave_value_by_path (tree, path) {
    return path.split('.').reduce(
        (node, key) => {
            // For DEBUG
            if (node[key] === undefined) {
                console.log('no', key, 'from', path, 'at', node)
            }
            return node[key]
        },
        tree
    )
}

module.exports = (current, changes) =>
    changes
        ?
            Object.keys(changes)
            .map(path => [
                path,
                get_leave_value_by_path(current, path),
                changes[path]
            ])
            .filter(_ => _[1] !== _[2])
        :
            []
