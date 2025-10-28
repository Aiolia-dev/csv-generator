import { Encoding } from '@/types';

/**
 * Download CSV content as a file
 * @param content - CSV content
 * @param filename - Filename (without extension)
 * @param encoding - File encoding
 */
export function downloadCSV(
  content: string,
  filename = 'generated',
  encoding = Encoding.UTF8
): void {
  try {
    // Create blob with appropriate encoding
    const blob = createBlob(content, encoding);

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
}

/**
 * Create blob with appropriate encoding
 * @param content - Content to encode
 * @param encoding - Target encoding
 * @returns Blob with encoded content
 */
function createBlob(content: string, encoding: Encoding): Blob {
  switch (encoding) {
    case Encoding.UTF8:
      return new Blob([content], { type: 'text/csv;charset=utf-8;' });

    case Encoding.UTF16:
      return new Blob([content], { type: 'text/csv;charset=utf-16;' });

    case Encoding.ASCII: {
      // Convert to ASCII (strip non-ASCII characters)
      // eslint-disable-next-line no-control-regex
      const asciiContent = content.replace(/[^\x00-\x7F]/g, '');
      return new Blob([asciiContent], { type: 'text/csv;charset=us-ascii;' });
    }

    case Encoding.ISO88591:
      return new Blob([content], { type: 'text/csv;charset=iso-8859-1;' });

    default:
      return new Blob([content], { type: 'text/csv;charset=utf-8;' });
  }
}

/**
 * Check if browser supports file downloads
 * @returns true if downloads are supported
 */
export function isDownloadSupported(): boolean {
  try {
    return !!(document.createElement('a').download !== undefined && window.URL);
  } catch {
    return false;
  }
}

/**
 * Generate filename with timestamp
 * @param prefix - Filename prefix
 * @returns Filename with timestamp
 */
export function generateFilename(prefix = 'csv'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${prefix}_${timestamp}`;
}

/**
 * Copy content to clipboard
 * @param content - Content to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(content: string): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}
