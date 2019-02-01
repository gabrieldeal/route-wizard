import convertFileNameExtension from '../../src/lib/convertFileNameExtension';

describe('convertFileNameExtension', () => {
  it('handles files with no extension', () => {
    expect(
      convertFileNameExtension({ fileName: 'foo', newExtension: 'bar' })
    ).toEqual('foo.bar');
    expect(
      convertFileNameExtension({ fileName: '/1/2/foo', newExtension: 'bar' })
    ).toEqual('/1/2/foo.bar');
    expect(
      convertFileNameExtension({ fileName: '', newExtension: 'bar' })
    ).toEqual('.bar');
  });

  it('handles files with an extension', () => {
    const fileNames = [
      'foo.gpx',
      'foo.GPX',
      'foo.json',
      'foo.jSON',
      'foo.kml',
      'foo.kMl',
    ];
    fileNames.forEach((fileName) => {
      expect(
        convertFileNameExtension({ fileName, newExtension: 'bar' })
      ).toEqual('foo.bar');
    });
  });
});
