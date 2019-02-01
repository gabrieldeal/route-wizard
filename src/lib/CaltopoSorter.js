import cloneDeep from 'lodash/cloneDeep';

export const TITLE_REGEXP = /^([0-9]+(?:\.[0-9]+)?)(?: +)(.*)/;

export function shouldSort(feature) {
  return feature.geometry && feature.geometry.type === 'LineString';
}

// Sort LineString features based on zero-padded numbers at the
// start of their titles.
export default class CaltopoSorter {
  constructor({ geoJson }) {
    this.geoJson = cloneDeep(geoJson);
  }

  cmpFeatures = (a, b) => {
    const aPrefixMatch = TITLE_REGEXP.exec(a.properties.title);
    const bPrefixMatch = TITLE_REGEXP.exec(b.properties.title);

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
    const otherFeatures = this.geoJson.features.filter(
      (feature) => !shouldSort(feature)
    );
    const sortedFeatures = this.geoJson.features
      .filter(shouldSort)
      .sort(this.cmpFeatures);
    const features = sortedFeatures.concat(otherFeatures);

    return { ...this.geoJson, features };
  };
}
