const RE_LATIN = "a-zA-Z";
const RE_NUMBERS = "0-9";
const RE_GERMAN = "äÄüÜöÖß";
const RE_VIETNAMESE =
  "àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹý" +
  "ÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ"; // source: https://stackoverflow.com/a/46265018

export const generateVariableName = (title: string) => {
  const filter = new RegExp(String.raw`/[^${RE_LATIN}${RE_NUMBERS}${RE_GERMAN}${RE_VIETNAMESE}_]/g`);
  return title.normalize("NFC").trim().replace(/ /g, "_").replace(filter, "");
};
