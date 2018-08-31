import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { preadFile } from '../lib/readFile';

import createSegments from '../lib/createSegments';
import createSpreadsheet from '../lib/createSpreadsheet';
import Layout from '../components/layout';
import ReadFileButton from '../components/readFileButton';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';

class SpreadsheetPage extends React.Component {
  static propTypes = {
    columns: PropTypes.array, // Just the columns that we are displaying.
    error: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    rows: PropTypes.array,
    setColumns: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
  };

  // Convert each row from a hash to an array of values.  This also filters
  // out the values for columns that we are not displaying.
  rows() {
    return this.props.rows.map((row) =>
      this.props.columns.map((column) => row[column['key']])
    );
  }

  createSpreadsheet(geoJson) {
    const segments = createSegments(geoJson);

    return createSpreadsheet(segments);
  }

  handleSelectedFile = (event) => {
    this.props.setRows([]);
    this.props.setColumns([]);
    this.props.setError(null);
    this.props.setIsLoading(true);

    preadFile({ file: event.target.files[0] })
      .then((geoJson) => {
        const { rows, columns } = this.createSpreadsheet(geoJson);
        this.props.setRows(rows);
        this.props.setColumns(columns);
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
          <SpreadsheetExportButton columns={this.props.columns} rows={rows} />
        )}
        {this.props.error && <div>{this.props.error}</div>}
        {haveData && (
          <SpreadsheetTable columns={this.props.columns} rows={rows} />
        )}
      </Layout>
    );
  }
}

const enhance = compose(
  withState('columns', 'setColumns', []),
  withState('rows', 'setRows', []),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false)
);

export default enhance(SpreadsheetPage);
