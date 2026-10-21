import { formatCompactNumber, formatRuntime, getSimilarQuery } from '../utils/format';

describe('formatRuntime', () => {
  it.each([
    [136, '2h 16m'],
    [120, '2h'],
    [45, '45m'],
    [null, null],
    [0, null],
  ])('%p -> %p', (input, expected) => {
    expect(formatRuntime(input)).toBe(expected);
  });
});

describe('formatCompactNumber', () => {
  it.each([
    [849165, '849K'],
    [1_234_567, '1.2M'],
    [12_500, '12.5K'],
    [999, '999'],
    [null, null],
  ])('%p -> %p', (input, expected) => {
    expect(formatCompactNumber(input)).toBe(expected);
  });
});

describe('getSimilarQuery', () => {
  it.each([
    ['Guardians of the Galaxy: Vol. 2', 'Guardians of the Galaxy'],
    ['Blade Runner 2049', 'Blade Runner'],
    ['Dune: Part Two', 'Dune'],
    ['Star Wars: Episode IV - A New Hope', 'Star Wars'],
    ['The Dark Knight', 'Dark Knight'],
    ['Toy Story 3', 'Toy Story'],
    ['Up', null],
  ])('%p -> %p', (title, expected) => {
    expect(getSimilarQuery(title)).toBe(expected);
  });
});
