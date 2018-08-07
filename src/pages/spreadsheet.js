import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { readFile, Route } from 'route-wizard-lib';

import Layout from '../components/layout';
import ReadFileButton from '../components/readFileButton';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';

function metersToFeet(meters) {
  return meters * 3.28084;
}

function metersToMiles(meters) {
  return meters * 0.000621371;
}

const SpreadsheetPage = (props) => {
  const {
    error,
    isLoading,
    segments,
    setError,
    setIsLoading,
    setSegments,
  } = props;

  const handleSelectedFile = (event) => {
    const file = event.target.files[0];
    setIsLoading(true);
    setSegments([]);
    const receiveFileContents = (geoJson) => {
      const route = new Route({ geoJson });
      route
        .data()
        .then((data) => {
          setSegments(data);
          setError(null);
          setIsLoading(false);
        })
        .catch((error) => {
          setError(error.message || error);
          setIsLoading(false);
        });
    };
    readFile({ file, receiveFileContents });
  };

  const columns = [
    { key: 'from', name: 'From' },
    { key: 'to', name: 'To' },
    { key: 'distance', name: 'Distance (mi)' },
    //    { key: 'gain', name: 'Gain (feet)' },
    //    { key: 'loss', name: 'Loss (feet)' },
    { key: 'users', name: 'Users' },
    { key: 'surface', name: 'Surface' },
    { key: 'locomotion', name: 'Locomotion' },
    { key: 'description', name: 'Description' },
  ];
  const rows = segments
    .map((segment) => ({
      ...segment,
      distance: metersToMiles(segment.distance).toFixed(1),
      gain: metersToFeet(segment.gain).toFixed(0),
      loss: metersToFeet(segment.loss).toFixed(0),
    }))
    .map((segment) => columns.map((column) => segment[column['key']]));

  const haveData = rows.length > 0;
  const whatIsThis = (
    <div>
      Convert a GeoJSON file to a spreadsheet that breaks down the distance
      between line segments and markers. Requires the line in the GeoJSON file
      to be ordered.
    </div>
  );

  return (
    <Layout pageTitle="Spreadsheet Generator" whatIsThis={whatIsThis}>
      <ReadFileButton onChange={handleSelectedFile} isLoading={isLoading}>
        Load route (GeoJSON)
      </ReadFileButton>
      {haveData && <SpreadsheetExportButton columns={columns} rows={rows} />}
      {error && <div>{error}</div>}
      {haveData && <SpreadsheetTable columns={columns} rows={rows} />}
    </Layout>
  );
};

SpreadsheetPage.propTypes = {
  classes: PropTypes.object.isRequired,
  error: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  segments: PropTypes.array,
  setError: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  setSegments: PropTypes.func.isRequired,
};

const enhance = compose(
  withState('segments', 'setSegments', []),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false)
);

export default enhance(SpreadsheetPage);
