import Checkbox from '@material-ui/core/Checkbox';
import compose from 'recompose/compose';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { withStyles } from '@material-ui/core/styles';

import addElevation from '../lib/addElevation';
import CaltopoSorter from '../lib/CaltopoSorter';
import createSegments from '../lib/createSegments';
import createSpreadsheet from '../lib/createSpreadsheet';
import Layout from '../components/layout';
import ReadFileButton from '../components/readFileButton';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';
import { preadJson } from '../lib/readFile';

const styles = () => ({
  newOrder: {
    paddingTop: '1em',
  },
});

class IndexPage extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    columns: PropTypes.array, // Just the columns that we are displaying.
    error: PropTypes.string,
    fileName: PropTypes.string,
    geoJson: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    rows: PropTypes.array,
    setColumns: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setFileName: PropTypes.func.isRequired,
    setGeoJson: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setShouldStripTitleNumber: PropTypes.func.isRequired,
    shouldStripTitleNumber: PropTypes.bool.isRequired,
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
    const file = event.target.files[0];

    this.props.setColumns([]);
    this.props.setError(null);
    this.props.setFileName(file.name);
    this.props.setGeoJson(null);
    this.props.setIsLoading(true);
    this.props.setRows([]);

    preadJson({ file })
      .then((geoJson) => {
        return new CaltopoSorter({
          geoJson,
          shouldStripTitleNumber: this.props.shouldStripTitleNumber,
        }).sort();
      })
      .then((geoJson) => {
        return addElevation({ geoJson: JSON.stringify(geoJson) }); // FIXME
      })
      .then((geoJson) => {
        const { rows, columns } = this.createSpreadsheet(geoJson);
        this.props.setColumns(columns);
        this.props.setError(null);
        this.props.setIsLoading(false);
        this.props.setRows(rows);
      })
      .catch((error) => {
        this.props.setColumns([]);
        this.props.setError(error.message || error);
        this.props.setIsLoading(false);
        this.props.setRows([]);
      });
  };

  renderInputs() {
    return (
      <FormGroup row>
        <ReadFileButton
          onChange={this.handleSelectedFile}
          isLoading={this.props.isLoading}
        >
          Load route (GeoJSON)
        </ReadFileButton>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldStripTitleNumber}
              color="primary"
              onChange={(_event, value) =>
                this.props.setShouldStripTitleNumber(value)
              }
            />
          }
          label="Strip ordering numbers from titles"
        />
      </FormGroup>
    );
  }

  renderError() {
    return this.props.error && <div>{this.props.error}</div>;
  }

  render() {
    const rows = this.rows();
    const haveData = rows.length > 0;

    return (
      <Layout pageTitle="Spreadsheet Generator">
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
  withStyles(styles),
  withState('columns', 'setColumns', []),
  withState('error', 'setError'),
  withState('fileName', 'setFileName'),
  withState('geoJson', 'setGeoJson'),
  withState('isLoading', 'setIsLoading', false),
  withState('rows', 'setRows', []),
  withState('shouldStripTitleNumber', 'setShouldStripTitleNumber', false)
);

export default enhance(IndexPage);
