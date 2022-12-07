var toFlat = (data, prefix = '') =>
  Object.keys(data).reduce((acc, el) => {
    let nextPrefix = prefix ? `${prefix}.${el}` : el

    if (typeof data[el] !== 'string')
      return {
        ...acc,
        ...toFlat(data[el], nextPrefix)
      }

    acc[nextPrefix] = data[el]
    return acc
  }, {})


module.exports = toFlat
