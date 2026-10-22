const formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${formatter.format(bytes / 1024)} Ko`;
  return `${formatter.format(bytes / (1024 * 1024))} Mo`;
}
