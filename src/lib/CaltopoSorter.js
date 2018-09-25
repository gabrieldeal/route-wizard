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
      this.shouldSort(feature) &&
      this.titleRegexp.test(feature.properties.title)
    );
  };

  shouldSort = (feature) => {
    return feature.geometry && feature.geometry.type === 'LineString';
  };

  cmpFeatures = (a, b) => {
    const aPrefixMatch = this.titleRegexp.exec(a.properties.title);
    const bPrefixMatch = this.titleRegexp.exec(b.properties.title);

    if (aPrefixMatch && bPrefixMatch) {
      const aPrefix = parseFloat(aPrefixMatch[1]);
      const bPrefix = parseFloat(bPrefixMatch[1]);

      return Math.sign(aPrefix - bPrefix);
    }

    if (aPrefixMatch) {
      return -1;
    }

    if (bPrefixMatch) {
      return 1;
    }

    return a.properties.title.localeCompare(b.properties.title);
  };

  sort = () => {
    const count = this.geoJson.features.filter(this.shouldConvert).length;
    const numDigits = count.toString().length;
    let index = 1;

    const convertFeature = (feature) => {
      const prefix = index.toString().padStart(numDigits, '0');
      index++;
      const origTitle = feature.properties.title;
      const suffix = this.titleRegexp.exec(origTitle)[2];
      const title = this.shouldStripTitleNumber
        ? suffix
        : prefix + ' ' + suffix;

      return merge(feature, { properties: { title } });
    };

    const otherFeatures = this.geoJson.features.filter(
      (feature) => !this.shouldSort(feature)
    );
    const convertedFeatures = this.geoJson.features
      .filter(this.shouldSort)
      .sort(this.cmpFeatures)
      .map(
        (feature) =>
          this.shouldConvert(feature) ? convertFeature(feature) : feature
      );
    const features = convertedFeatures.concat(otherFeatures);

    return { ...this.geoJson, features };
  };
}
