import CaltopoSorter from '../../src/lib/CaltopoSorter';

describe('CaltopoSorter', function() {
  function sortGeoJson(fixtureName) {
    const geoJson = readJSON(`./spec/fixture/${fixtureName}`);
    return new CaltopoSorter({ geoJson }).sort();
  }

  it('sorts', () => {
    const expected = [
      '1 approach',
      '2 North Ridge',
      '3 Cascadian Couloir',
      '4 Camp',
      'A folder',
      'Mount Stuart',
      'A polygon',
      'Unnumbered line 1',
      'Unnumbered line 2',
    ];
    const sorted = sortGeoJson('CaltopoSorter-route.json'); // https://caltopo.com/m/FBTQ
    const titles = sorted.features.map((feature) => feature.properties.title);

    expect(titles).toEqual(expected);
  });
});
