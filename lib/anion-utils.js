module.exports = {
	uniqueArray: function (arr) {
		var result = [];
		arr.forEach(function (item) {
			if(result.indexOf(item) < 0) {
				result.push(item);
			}
		});
		return result;
	}
}