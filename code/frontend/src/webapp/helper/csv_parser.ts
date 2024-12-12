export const parseCSV = (csv: string): { [key: string]: string }[] => {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] == "") {
      continue;
    }
    const obj: { [key: string]: string } = {};
    const currentline = lines[i].split(",");
    for (let j = 0; j < headers.length; j++) {
      if (headers[j] != "") {
        obj[headers[j]] = currentline[j];
      }
    }
    result.push(obj);
  }
  return result;
};
