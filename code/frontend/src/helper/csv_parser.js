export default function(csv) {
  var lines = csv.split("\n");
  var result = [];
  var headers = lines[0].split(",");
  for (var i = 1; i < lines.length; i++) {
    if (lines[i] == "") {
      continue;
    }
    var obj = {};
    var currentline = lines[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] != "") {
        obj[headers[j]] = currentline[j];
      }
    }
    result.push(obj);
  }
  return result;
}
