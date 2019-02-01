import CaltopoSorter from '../../src/lib/CaltopoSorter';

describe('CaltopoSorter', function() {
  function sortGeoJson(fixtureName) {
    const geoJson = readJSON(`./spec/fixture/${fixtureName}`);
    return new CaltopoSorter({ geoJson }).sort();
  }

  it('sorts', () => {
    const expected = [
      '01.5 approach',
      '01.51 North Ridge',
      '02 Cascadian Couloir',
      '02.1 Camp',
      'Unnumbered line 1',
      'Unnumbered line 2',
      'A folder',
      'Mount Stuart',
      'A polygon',
    ];
    const sorted = sortGeoJson('CaltopoSorter-route.json'); // https://caltopo.com/m/FBTQ
    const titles = sorted.features.map((feature) => feature.properties.title);

    expect(titles).toEqual(expected);
  });
});
