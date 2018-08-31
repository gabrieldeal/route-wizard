import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { preadFile } from '../lib/readFile';

import createSpreadsheetRows from '../lib/createSpreadsheetRows';
import Layout from '../components/layout';
import parseGeoJson from '../lib/parseGeoJson';
import ReadFileButton from '../components/readFileButton';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';

class SpreadsheetPage extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    rows: PropTypes.array,
    setError: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
  };

  allColumns = [
    {
      key: 'cumulativeDistance',
      name: 'Cumulative distance (mi)',
    },
    { key: 'location', name: 'Location' },
    { key: 'distance', name: 'Distance (mi)' },
    { key: 'gain', name: 'Elevation gain (feet)' },
    { key: 'loss', name: 'Elevation loss (feet)' },
    { key: 'description', name: 'Notes' },
    { key: 'users', name: 'Users' },
    { key: 'surface', name: 'Surface' },
    { key: 'locomotion', name: 'Locomotion' },
  ];

  columns() {
    const optionalColumns = ['users', 'surface', 'locomotion'];
    const unusedOptionalColumns = optionalColumns.filter(
      (optionalColumn) => !this.props.rows.find((row) => row[optionalColumn])
    );

    return this.allColumns.filter(
      (column) => !unusedOptionalColumns.includes(column.key)
    );
  }

  rows() {
    return this.props.rows.map((row) =>
      this.columns().map((column) => row[column['key']])
    );
  }

  geoJsonToSpreadsheetRows(geoJson) {
    const rows = parseGeoJson(geoJson);

    return createSpreadsheetRows(rows);
  }

  handleSelectedFile = (event) => {
    this.props.setError(null);
    this.props.setIsLoading(true);
    this.props.setRows([]);

    preadFile({ file: event.target.files[0] })
      .then((geoJson) => {
        this.props.setRows(this.geoJsonToSpreadsheetRows(geoJson));
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
  withState('rows', 'setRows', []),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false)
);

export default enhance(SpreadsheetPage);
