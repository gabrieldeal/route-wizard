import caltopoStripper from '../../src/lib/caltopoStripper';

describe('caltopoStripper', function() {
  function stripGeoJson(fixtureName, shouldStripTitleNumber) {
    const geoJson = readJSON(`./spec/fixture/${fixtureName}`);
    return new caltopoStripper({ geoJson, shouldStripTitleNumber });
  }

  it('strips', () => {
    const expected = [
      'A folder',
      'Mount Stuart',
      'North Ridge',
      'Cascadian Couloir',
      'Camp',
      'approach',
      'A polygon',
      'Unnumbered line 1',
      'Unnumbered line 2',
    ];
    const striped = stripGeoJson('CaltopoSorter-route.json', true);
    const titles = striped.features.map((feature) => feature.properties.title);

    expect(titles).toEqual(expected);
  });

  it('renumbers', () => {
    const expected = [
      'A folder',
      'Mount Stuart',
      '1 North Ridge',
      '2 Cascadian Couloir',
      '3 Camp',
      '4 approach',
      'A polygon',
      'Unnumbered line 1',
      'Unnumbered line 2',
    ];
    const striped = stripGeoJson('CaltopoSorter-route.json', false);
    const titles = striped.features.map((feature) => feature.properties.title);

    expect(titles).toEqual(expected);
  });
});
