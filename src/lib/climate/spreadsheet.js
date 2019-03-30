import dayjs from './dayjs';
import XLSX from 'xlsx';
import fromPairs from 'lodash/fromPairs';

// https://www.npmjs.com/package/xlsx
export function readRawData(changeEvent) {
  return new Promise((resolve) => {
    const file = changeEvent.target.files[0];
    const fileReader = new FileReader();
    const readAsBinary = !!fileReader.readAsBinaryString;

    fileReader.onload = function(loadEvent) {
      const data = readAsBinary
        ? loadEvent.target.result
        : new Uint8Array(data);
      const type = readAsBinary ? 'binary' : 'array';

      resolve({ data, type });
    };

    if (readAsBinary) {
      fileReader.readAsBinaryString(file);
    } else {
      fileReader.readAsArrayBuffer(file);
    }
  });
}

function findColumnToPropertyMapping({
  actualColumns,
  possibleColumns,
  propertyName,
  valueConverter,
}) {
  const column = possibleColumns
    .concat(
      possibleColumns.map((possibleColumn) => possibleColumn.toLowerCase())
    )
    .find((possibleColumn) => actualColumns.includes(possibleColumn));
  if (!column) {
    throw new Error(`Missing the '${possibleColumns[0]}' column`);
  }

  return [column, propertyName, valueConverter];
}

function parseDate(dateStr) {
  return dayjs(dateStr).utc();
}

const latitudeConfig = {
  possibleColumns: ['Latitude', 'Lat'],
  propertyName: 'lat',
  valueConverter: parseFloat,
};
const longitudeConfig = {
  possibleColumns: ['Longitude', 'Lon'],
  propertyName: 'lon',
  valueConverter: parseFloat,
};
const dateConfig = {
  possibleColumns: ['Date'],
  propertyName: 'date',
  valueConverter: parseDate,
};

export function parse({ data, type }) {
  const options = {
    type,
    cellDates: true,
  };
  const workBook = XLSX.read(data, options);
  const workSheetName = workBook.SheetNames[0];
  const workSheet = workBook.Sheets[workSheetName];
  const rows = XLSX.utils.sheet_to_json(workSheet, { raw: true });
  if (rows.length === 0) {
    return {
      errorMessage: 'Unable to parse spreadsheet',
    };
  }

  const actualColumns = Object.keys(rows[0]);
  const columnToPropertyMappings = [
    findColumnToPropertyMapping({ actualColumns, ...longitudeConfig }),
    findColumnToPropertyMapping({ actualColumns, ...latitudeConfig }),
    findColumnToPropertyMapping({ actualColumns, ...dateConfig }),
  ];

  const queries = rows.map((row) => {
    const query = fromPairs(
      columnToPropertyMappings.map(([column, propertyName, converter]) => [
        propertyName,
        converter(row[column]),
      ])
    );
    query.row = row;

    return query;
  });

  return { queries, workBook };
}
