import { movieDetailsFixture, searchResponseFixture } from '../__fixtures__/omdb';
import {
  mapMovieDetails,
  mapSearchResponse,
  toList,
  toNullable,
  toNumber,
  toRuntimeMinutes,
  toScore,
} from '../mappers';
import { movieDetailsDtoSchema, searchResponseDtoSchema } from '../schemas';

describe('primitive mappers', () => {
  it('treats "N/A" and blanks as missing', () => {
    expect(toNullable('N/A')).toBeNull();
    expect(toNullable('  ')).toBeNull();
    expect(toNullable(undefined)).toBeNull();
    expect(toNullable(' PG-13 ')).toBe('PG-13');
  });

  it('splits comma-separated lists', () => {
    expect(toList('Action, Adventure ,Comedy')).toEqual(['Action', 'Adventure', 'Comedy']);
    expect(toList('N/A')).toEqual([]);
  });

  it('parses formatted numbers', () => {
    expect(toNumber('849,165')).toBe(849165);
    expect(toNumber('7.6')).toBe(7.6);
    expect(toNumber('$389,813,101')).toBe(389813101);
    expect(toNumber('N/A')).toBeNull();
    expect(toNumber('none')).toBeNull();
  });

  it('parses runtime minutes', () => {
    expect(toRuntimeMinutes('136 min')).toBe(136);
    expect(toRuntimeMinutes('N/A')).toBeNull();
  });

  it('normalizes rating scales to 0-100', () => {
    expect(toScore('7.6/10')).toBe(76);
    expect(toScore('85%')).toBe(85);
    expect(toScore('67/100')).toBe(67);
    expect(toScore('A+')).toBeNull();
  });
});

describe('mapSearchResponse', () => {
  const dto = searchResponseDtoSchema.parse(searchResponseFixture);

  it('maps items and pagination', () => {
    const page = mapSearchResponse(dto, 1);
    expect(page.totalResults).toBe(587);
    expect(page.hasNextPage).toBe(true);
    expect(page.items[0]).toEqual(
      expect.objectContaining({ id: 'tt0372784', title: 'Batman Begins', type: 'movie' }),
    );
    expect(page.items[1]).toEqual(expect.objectContaining({ type: 'series', posterUrl: null }));
  });

  it('reports the last page', () => {
    expect(mapSearchResponse(dto, 59).hasNextPage).toBe(false);
  });
});

describe('mapMovieDetails', () => {
  it('maps a real OMDb record into the domain model', () => {
    const details = mapMovieDetails(movieDetailsDtoSchema.parse(movieDetailsFixture));

    expect(details).toEqual(
      expect.objectContaining({
        id: 'tt3896198',
        runtimeMinutes: 136,
        genres: ['Action', 'Adventure', 'Comedy'],
        directors: ['James Gunn'],
        actors: ['Chris Pratt', 'Zoe Saldaña', 'Dave Bautista'],
        imdbRating: 7.6,
        imdbVotes: 849165,
        metascore: 67,
        boxOffice: '$389,813,101',
      }),
    );
    expect(details.ratings.map(r => [r.source, r.score])).toEqual([
      ['imdb', 76],
      ['rottenTomatoes', 85],
      ['metacritic', 67],
    ]);
  });
});
