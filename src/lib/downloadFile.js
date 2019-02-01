import convertFileNameExtension from '../lib/convertFileNameExtension';
import { saveAs } from 'file-saver/FileSaver';

export default function({
  fileContents,
  fileName: origFileName,
  fileExtension,
}) {
  var geoJsonBlob = new Blob([fileContents], {
    type: 'application/json;charset=utf-8',
  });
  const fileName = convertFileNameExtension({
    fileName: origFileName,
    newExtension: fileExtension,
  });

  saveAs(geoJsonBlob, fileName);
}
