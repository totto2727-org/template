
export function indentText(text: string) {
  const lines = text.split('\n');
  let indentLevel = 0;
  const formattedLines = lines.map((line) => {
    const openBrackets = (line.match(/[({[]/g) || []).length;
    const closeBrackets = (line.match(/[)}\]]/g) || []).length;
    const indent = '  '.repeat(indentLevel);
    indentLevel += openBrackets - closeBrackets;
    return indent + line.trim();
  });
  return formattedLines.join('\n');
}
