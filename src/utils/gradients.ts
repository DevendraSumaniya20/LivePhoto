export const gradientColors: string[][] = [
  ['#FFD7D7', '#FFF0F0'],
  ['#FFE7BA', '#FFF6E0'],
  ['#D7F9FF', '#E0FFFF'],
  ['#E0FFD7', '#F0FFF0'],
  ['#FFF4D7', '#FFFCEF'],
  ['#F5D7FF', '#FAE0FF'],
];

export const getRandomGradient = (): string[] => {
  const index = Math.floor(Math.random() * gradientColors.length);
  return gradientColors[index];
};

export const getGradientProps = (
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
) => ({
  colors: getRandomGradient(),
  start,
  end,
});
