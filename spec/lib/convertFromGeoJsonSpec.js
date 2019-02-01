import { toGpx, toKml } from '../../src/lib/convertFromGeoJson';

describe('convertFromGeoJson', () => {
  const geoJson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { description: 'The Description', title: 'The Title' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [-120.92728614807129, 47.47037116457148],
            [-120.93252182006836, 47.48110359996791],
          ],
        },
      },
    ],
    properties: { title: '(Unnamed)' },
  };

  it('converts GPX', () => {
    const expectedGpx = `<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="togpx"><metadata/><trk><name>The Title</name><desc>The Description</desc><trkseg><trkpt lat="47.47037116457148" lon="-120.92728614807129"/><trkpt lat="47.48110359996791" lon="-120.93252182006836"/></trkseg></trk></gpx>`;

    expect(toGpx(geoJson)).toEqual(expectedGpx);
  });

  it('converts KML', () => {
    const expectedKml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><name>The Title</name><description>The Description</description><ExtendedData><Data name="description"><value>The Description</value></Data><Data name="title"><value>The Title</value></Data></ExtendedData><LineString><coordinates>-120.92728614807129,47.47037116457148 -120.93252182006836,47.48110359996791</coordinates></LineString></Placemark></Document></kml>`;

    expect(toKml(geoJson)).toEqual(expectedKml);
  });
});
