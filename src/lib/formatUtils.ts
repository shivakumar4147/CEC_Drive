/**
 * Formats a file size in bytes or string representation.
 * Files under 0.1 MB (or formatted as "0.0 MB") are formatted in KB (e.g., "45 KB").
 */
export function formatFileSize(bytesOrString: number | string | undefined | null): string {
  if (bytesOrString === undefined || bytesOrString === null) {
    return '0 KB';
  }

  if (typeof bytesOrString === 'number') {
    if (isNaN(bytesOrString) || bytesOrString <= 0) return '0 KB';
    if (bytesOrString < 100 * 1024) {
      const kb = Math.round(bytesOrString / 1024);
      return `${Math.max(1, kb)} KB`;
    }
    return `${(bytesOrString / (1024 * 1024)).toFixed(1)} MB`;
  }

  const str = String(bytesOrString).trim();
  if (!str) return '0 KB';

  // Raw numeric string in bytes
  if (/^\d+$/.test(str)) {
    return formatFileSize(parseInt(str, 10));
  }

  // Exact 0.0 MB / 0 MB check
  if (/^0\.0\s*MB$/i.test(str) || /^0\s*MB$/i.test(str)) {
    return '0 KB';
  }

  // Parses MB strings
  const mbMatch = str.match(/^([0-9.]+)\s*MB$/i);
  if (mbMatch) {
    const mbVal = parseFloat(mbMatch[1]);
    if (!isNaN(mbVal)) {
      if (mbVal <= 0) return '0 KB';
      if (mbVal < 0.05) { // Formats to 0.0 MB -> convert to KB
        const approxKb = Math.round(mbVal * 1024);
        return approxKb > 0 ? `${approxKb} KB` : '0 KB';
      }
      if (mbVal < 0.1) {
        const approxKb = Math.round(mbVal * 1024);
        return `${approxKb} KB`;
      }
      return `${mbVal.toFixed(1)} MB`;
    }
  }

  // Parses KB strings
  const kbMatch = str.match(/^([0-9.]+)\s*KB$/i);
  if (kbMatch) {
    const kbVal = Math.round(parseFloat(kbMatch[1]));
    return `${kbVal} KB`;
  }

  return str;
}
