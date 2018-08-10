import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { preadFile, Route } from 'route-wizard-lib';

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

class SpreadsheetPage extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    error: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    segments: PropTypes.array,
    setError: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setSegments: PropTypes.func.isRequired,
  };

  columns = [
    { key: 'from', name: 'Starting point' },
    { key: 'to', name: 'Ending point' },
    { key: 'distance', name: 'Distance (mi)' },
    {
      key: 'cumulativeDistance',
      name: 'Cumulative distance to starting point (mi)',
    },
    //    { key: 'gain', name: 'Gain (feet)' },
    //    { key: 'loss', name: 'Loss (feet)' },
    { key: 'users', name: 'Users' },
    { key: 'surface', name: 'Surface' },
    { key: 'locomotion', name: 'Locomotion' },
    { key: 'description', name: 'Starting point info' },
  ];

  rows() {
    return this.props.segments
      .map((segment) => ({
        ...segment,
        cumulativeDistance: metersToMiles(segment.cumulativeDistance).toFixed(
          1
        ),
        distance: metersToMiles(segment.distance).toFixed(1),
        gain: metersToFeet(segment.gain).toFixed(0),
        loss: metersToFeet(segment.loss).toFixed(0),
      }))
      .map((segment) => this.columns.map((column) => segment[column['key']]));
  }

  handleSelectedFile = (event) => {
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
        between line segments and markers. Requires the line in the GeoJSON file
        to be ordered.
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
          <SpreadsheetExportButton columns={this.columns} rows={rows} />
        )}
        {this.props.error && <div>{this.props.error}</div>}
        {haveData && <SpreadsheetTable columns={this.columns} rows={rows} />}
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
