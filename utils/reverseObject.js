module.exports = (set) => {
  return Object.keys(set).reduce((paths, key) => {
    paths[set[key]] = key
    return paths
  }, {})
}
