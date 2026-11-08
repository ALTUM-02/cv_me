export function googleFontsStylesheet(fontNames: string[]): string {
  const params = new URLSearchParams();
  [...new Set(fontNames)].forEach((fontName) => {
    params.append('family', `${fontName}:wght@400;600;700`);
  });
  params.set('display', 'swap');
  return `https://fonts.googleapis.com/css2?${params.toString()}`;
}
