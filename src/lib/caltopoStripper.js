import merge from 'lodash/merge';
import { shouldSort, TITLE_REGEXP } from './CaltopoSorter';

function shouldConvert(feature) {
  return shouldSort(feature) && TITLE_REGEXP.test(feature.properties.title);
}

// FIXME: Rename this to normalizeLineTitles(). It does more than strip numeric prefixes.
export default function({ geoJson, shouldStripTitleNumber }) {
  const count = geoJson.features.filter(shouldConvert).length;
  const numDigits = count.toString().length;
  let index = 1;

  const convertFeature = (feature) => {
    if (!shouldConvert(feature)) {
      return feature;
    }

    const prefix = index.toString().padStart(numDigits, '0');
    index++;
    const origTitle = feature.properties.title;
    const suffix = TITLE_REGEXP.exec(origTitle)[2];
    const title = shouldStripTitleNumber ? suffix : prefix + ' ' + suffix;

    return merge(feature, { properties: { title } });
  };

  const features = geoJson.features.map(convertFeature);

  return { ...geoJson, features };
}
