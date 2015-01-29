var findMissing = function (list1, list2) {
  var sum = function (list) {
    var total = 0;
    for(var i in list) {
      total += parseInt(list[i],10);
    }
    return total;
  };

  return Math.abs(sum(list1) - sum(list2));
};