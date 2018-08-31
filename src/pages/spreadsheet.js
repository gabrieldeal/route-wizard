import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import React from 'react';
import Route from '../lib/Route';
import withState from 'recompose/withState';
import { preadFile } from '../lib/readFile';

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

function roundTo(number, position) {
  return Number(number.toFixed(position));
}

class SpreadsheetPage extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    segments: PropTypes.array,
    setError: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setSegments: PropTypes.func.isRequired,
  };

  allColumns = [
    { key: 'from', name: 'Starting point' },
    { key: 'to', name: 'Ending point' },
    { key: 'distance', name: 'Distance (mi)' },
    {
      key: 'cumulativeDistance',
      name: 'Cumulative distance to starting point (mi)',
    },
    { key: 'description', name: 'Starting point info' },
    { key: 'gain', name: 'Elevation gain (feet)' },
    { key: 'loss', name: 'Elevation loss (feet)' },
    //    { key: 'gain', name: 'Gain (feet)' },
    //    { key: 'loss', name: 'Loss (feet)' },
    { key: 'users', name: 'Users' },
    { key: 'surface', name: 'Surface' },
    { key: 'locomotion', name: 'Locomotion' },
  ];

  columns() {
    const optionalColumns = ['users', 'surface', 'locomotion'];
    const unusedOptionalColumns = optionalColumns.filter(
      (optionalColumn) =>
        !this.props.segments.find((segment) => segment[optionalColumn])
    );

    return this.allColumns.filter(
      (column) => !unusedOptionalColumns.includes(column.key)
    );
  }

  rows() {
    return this.props.segments
      .map((segment) => ({
        ...segment,
        cumulativeDistance: roundTo(
          metersToMiles(segment.cumulativeDistance),
          1
        ),
        distance: roundTo(metersToMiles(segment.distance), 1),
        gain: roundTo(metersToFeet(segment.gain), 0),
        loss: roundTo(metersToFeet(segment.loss), 0),
      }))
      .map((segment) => this.columns().map((column) => segment[column['key']]));
  }

  handleSelectedFile = (event) => {
    this.props.setError(null);
    this.props.setIsLoading(true);
    this.props.setSegments([]);

    preadFile({ file: event.target.files[0] })
      .then((geoJson) => new Route({ geoJson }).data())
      .then((data) => {
        this.props.setSegments(data);
        this.props.setError(null);
        this.props.setIsLoading(false);
      })
      .catch((error) => {
        this.props.setError(error.message || error);
        this.props.setIsLoading(false);
      });
  };

  render() {
    const rows = this.rows();
    const haveData = rows.length > 0;
    const whatIsThis = (
      <div>
        Convert a GeoJSON file to a spreadsheet that breaks down the distance
        between line segments and markers. Requires the lines in the GeoJSON
        file to be ordered.
      </div>
    );

    return (
      <Layout pageTitle="Spreadsheet Generator" whatIsThis={whatIsThis}>
        <ReadFileButton
          onChange={this.handleSelectedFile}
          isLoading={this.props.isLoading}
        >
          Load route (GeoJSON)
        </ReadFileButton>
        {haveData && (
          <SpreadsheetExportButton columns={this.columns()} rows={rows} />
        )}
        {this.props.error && <div>{this.props.error}</div>}
        {haveData && <SpreadsheetTable columns={this.columns()} rows={rows} />}
      </Layout>
    );
  }
}

const enhance = compose(
  withState('segments', 'setSegments', []),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false)
);

export default enhance(SpreadsheetPage);
