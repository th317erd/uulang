function flattenArray(array) {
  var result = [];

  for (var i = 0, il = array.length; i < il; i++) {
    var item = array[i];
    if (item instanceof Array) {
      result = result.concat(flattenArray(item));
      continue;
    }

    result.push(item);
  }

  return result;
}

function flattenArrayToString(array, filterCallback, separator = '') {
  var result = flattenArray(array);

  if (typeof filterCallback === 'function')
    result = result.filter(filterCallback);

  return result.join(separator);
}

module.exports = {
  flattenArray,
  flattenArrayToString
};
