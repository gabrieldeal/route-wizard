import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

export default class CaltopoSorter {
  constructor({ geoJson, shouldStripTitleNumber }) {
    this.geoJson = cloneDeep(geoJson);
    this.titleRegexp = /^([0-9]+(?:\.[0-9]+)?)(?: +)(.*)/;
    this.shouldStripTitleNumber = shouldStripTitleNumber;
  }

  shouldConvert = (feature) => {
    return (
      feature.geometry &&
      feature.geometry.type === 'LineString' &&
      this.titleRegexp.test(feature.properties.title)
    );
  };

  cmpFeatures = (a, b) => {
    const aPrefix = parseFloat(this.titleRegexp.exec(a.properties.title)[1]);
    const bPrefix = parseFloat(this.titleRegexp.exec(b.properties.title)[1]);

    return Math.sign(aPrefix - bPrefix);
  };

  sort = () => {
    const count = this.geoJson.features.filter(this.shouldConvert).length;
    const numDigits = count.toString().length;
    let index = 1;

    const convertFeature = (feature) => {
      const prefix = index.toString().padStart(numDigits, '0');
      index++;
      const suffix = this.titleRegexp.exec(feature.properties.title)[2];
      const title = this.shouldStripTitleNumber
        ? suffix
        : prefix + ' ' + suffix;

      return merge(feature, { properties: { title } });
    };

    const otherFeatures = this.geoJson.features.filter(
      (feature) => !this.shouldConvert(feature)
    );
    const convertedFeatures = this.geoJson.features
      .filter(this.shouldConvert)
      .sort(this.cmpFeatures)
      .map(convertFeature);
    const features = convertedFeatures.concat(otherFeatures);

    return { ...this.geoJson, features };
  };
}
