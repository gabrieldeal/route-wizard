import convertToGeoJson from '../../src/lib/convertToGeoJson';

describe('convertToGeoJson', () => {
  it('GeoJSON', () => {
    const fileName = 'foo.json';
    const fileContentsStr =
      '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-120.92728614807129,47.47037116457148],[-120.93252182006836,47.48110359996791]]},"properties":{"stroke":"#FF0000","stroke-opacity":1,"stroke-width":2,"fill":"#FF0000","fill-opacity":0.10196078431372549}}]}';
    const expectedJson =
      '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-120.92728614807129,47.47037116457148],[-120.93252182006836,47.48110359996791]]},"properties":{"stroke":"#FF0000","stroke-opacity":1,"stroke-width":2,"fill":"#FF0000","fill-opacity":0.10196078431372549,"title":""}}],"properties":{"title":""}}';
    const actualResult = convertToGeoJson({ fileContentsStr, fileName });

    expect(JSON.stringify(actualResult)).toEqual(expectedJson);
  });

  it('GPX', () => {
    const fileName = 'foo.gpx';
    const fileContentsStr = `<?xml version="1.0" encoding="UTF-8"?><gpx xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="CALTOPO"><trk><name>Short line</name><cmt/><extensions><gpxx:TrackExtension><gpxx:DisplayColor>Red</gpxx:DisplayColor></gpxx:TrackExtension></extensions><trkseg><trkpt lat="47.47037116457148" lon="-120.92728614807129"/><trkpt lat="47.48110359996791" lon="-120.93252182006836"/></trkseg></trk></gpx>`;
    const actualResult = convertToGeoJson({ fileContentsStr, fileName });
    const expectedJson = `{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Short line","cmt":"","title":"Short line"},"geometry":{"type":"LineString","coordinates":[[-120.92728614807129,47.47037116457148],[-120.93252182006836,47.48110359996791]]}}],"properties":{"title":""}}`;

    expect(JSON.stringify(actualResult)).toEqual(expectedJson);
  });

  it('KML', () => {
    const fileName = 'foo.kml';
    const fileContentsStr = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>CalTopo Export</name><description>Export from CalTopo</description><Folder><open>1</open><name>Lines and Polygons</name><Placemark><Style><LineStyle><color>FF0000FF</color><width>2.0</width></LineStyle><PolyStyle><fill>1</fill><outline>1</outline><width>2.0</width><color>1A0000FF</color></PolyStyle></Style><name>Short line</name><description/><LineString><altitudeMode>clampToGround</altitudeMode><tessellate>1</tessellate><coordinates>-120.92728614807129,47.47037116457148
-120.93252182006836,47.48110359996791
</coordinates></LineString></Placemark></Folder></Document></kml>`;
    const expectedJson =
      '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-120.92728614807129,47.47037116457148],[-120.93252182006836,47.48110359996791]]},"properties":{"name":"Short line","stroke":"#FF0000","stroke-opacity":1,"stroke-width":2,"fill":"#FF0000","fill-opacity":0.10196078431372549,"title":"Short line"}}],"properties":{"title":""}}';
    const actualResult = convertToGeoJson({ fileContentsStr, fileName });

    expect(JSON.stringify(actualResult)).toEqual(expectedJson);
  });
});
