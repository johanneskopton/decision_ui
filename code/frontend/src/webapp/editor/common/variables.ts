export const generateVariableName = (title: string) => {
  return title
    .trim()
    .replace(/ /g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
};
