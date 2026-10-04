/**
 * Generates a unique folder or file name within a directory by appending 1, 2, 3...
 * if a duplicate item already exists in the same directory.
 *
 * Examples:
 * - "New folder" -> "New folder" (if unique), or "New folder 1", "New folder 2"
 * - "business doc.pdf" -> "business doc.pdf" (if unique), or "business doc 1.pdf", "business doc 2.pdf"
 */
export const getUniqueItemName = (
  baseName: string,
  existingNames: string[],
  isFile = false
): string => {
  const defaultFallback = isFile ? 'Untitled File' : 'New folder';
  const rawInput = (baseName || '').trim();
  const targetInput = rawInput.length > 0 ? rawInput : defaultFallback;

  const existingSet = new Set(
    existingNames.map((name) => (name || '').trim().toLowerCase())
  );

  // Split extension for file names
  let stem = targetInput;
  let extension = '';

  if (isFile) {
    const lastDotIdx = targetInput.lastIndexOf('.');
    if (lastDotIdx > 0) {
      stem = targetInput.substring(0, lastDotIdx);
      extension = targetInput.substring(lastDotIdx);
    }
  }

  // Check if original name is already unique
  const fullNameCandidate = `${stem}${extension}`;
  if (!existingSet.has(fullNameCandidate.toLowerCase())) {
    return fullNameCandidate;
  }

  // Strip trailing number if stem ends with space + number (e.g., "New folder 1" -> "New folder")
  let rootStem = stem;
  const match = stem.match(/^(.*?)(?:\s+(\d+))$/);
  if (match && match[1]) {
    rootStem = match[1];
  }

  // Find next available integer suffix: 1, 2, 3...
  let counter = 1;
  while (true) {
    const candidate = `${rootStem} ${counter}${extension}`;
    if (!existingSet.has(candidate.toLowerCase())) {
      return candidate;
    }
    counter++;
  }
};
