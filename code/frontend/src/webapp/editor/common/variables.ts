export const generateVariableName = (title: string) => {
  return title
    .trim()
    .replace(" ", "_")
    .replace(/[^a-zA-Z0-9_]/, "");
};
