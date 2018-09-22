import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
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
import ExportFileButton from '../components/exportFileButton';
import Layout from '../components/layout';
import ReadFileButton from '../components/readFileButton';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';
import { preadFile } from '../lib/readFile';

const styles = () => ({
  errorContainer: {
    color: 'red',
    fontWeight: 800,
    marginBottom: 'auto',
    marginLeft: '1em',
    marginTop: 'auto',
  },
  exportButtonsContainer: {
    display: 'flex',
  },
  newOrder: {
    paddingTop: '1em',
  },
  progressMessageContainer: {
    marginBottom: 'auto',
    marginLeft: '1em',
    marginTop: 'auto',
  },
  progressSpinner: {
    marginRight: '1em',
  },
  readFileContainer: {
    display: 'flex',
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
    progressMessage: PropTypes.string,
    rows: PropTypes.array,
    setColumns: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setFileName: PropTypes.func.isRequired,
    setGeoJson: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setProgressMessage: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setShouldAddElevation: PropTypes.func.isRequired,
    setShouldSort: PropTypes.func.isRequired,
    setShouldStripTitleNumber: PropTypes.func.isRequired,
    shouldAddElevation: PropTypes.bool.isRequired,
    shouldSort: PropTypes.bool.isRequired,
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

  resetState() {
    this.props.setColumns([]);
    this.props.setError(null);
    this.props.setFileName(null);
    this.props.setGeoJson(null);
    this.props.setIsLoading(false);
    this.props.setProgressMessage(null);
    this.props.setRows([]);
  }

  handleSelectedFile = (event) => {
    const file = event.target.files[0];

    this.resetState();
    this.props.setFileName(file.name);
    this.props.setIsLoading(true);
    this.props.setProgressMessage('Loading file');

    preadFile({ file })
      .then((geoJson) => {
        if (!this.props.shouldAddElevation) {
          return geoJson;
        }

        this.props.setProgressMessage('Requesting elevation data');
        return addElevation({ geoJson: geoJson });
      })
      .then((geoJson) => JSON.parse(geoJson))
      .then((geoJson) => {
        if (!this.props.shouldSort) {
          return geoJson;
        }

        this.props.setProgressMessage('Sorting');
        return new CaltopoSorter({
          geoJson,
          shouldStripTitleNumber: this.props.shouldStripTitleNumber,
        }).sort();
      })
      .then((geoJson) => {
        this.props.setProgressMessage('Creating the spreadsheet');
        const { rows, columns } = this.createSpreadsheet(geoJson);
        this.props.setColumns(columns);
        this.props.setGeoJson(geoJson);
        this.props.setIsLoading(false);
        this.props.setProgressMessage(null);
        this.props.setRows(rows);
      })
      .catch((error) => {
        /* eslint-disable-next-line no-undef, no-console */
        console.error(error);

        this.resetState();
        this.props.setError(error.message || error);
      });
  };

  renderCheckboxes() {
    return (
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldSort}
              color="primary"
              onChange={(_event, value) => this.props.setShouldSort(value)}
            />
          }
          label="Sort segments by their titles. If your route editor does not let you control the order of the segments, then prefix their titles with numbers and check this box."
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldStripTitleNumber}
              color="primary"
              disabled={!this.props.shouldSort}
              onChange={(_event, value) =>
                this.props.setShouldStripTitleNumber(value)
              }
            />
          }
          label="Strip ordering numbers from segment titles after sorting."
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldAddElevation}
              color="primary"
              onChange={(_event, value) =>
                this.props.setShouldAddElevation(value)
              }
            />
          }
          label="Add elevation data."
        />
      </FormGroup>
    );
  }

  renderReadFileButton() {
    return (
      <ReadFileButton
        onChange={this.handleSelectedFile}
        isLoading={this.props.isLoading}
      >
        Load GeoJSON file
      </ReadFileButton>
    );
  }

  renderError() {
    return (
      this.props.error && (
        <div className={this.props.classes.errorContainer}>
          Error: {this.props.error}
        </div>
      )
    );
  }

  renderProgressMessage() {
    if (!this.props.progressMessage) {
      return null;
    }

    return (
      <div className={this.props.classes.progressMessageContainer}>
        <CircularProgress
          className={this.props.classes.progressSpinner}
          size={25}
          thickness={7}
        />
        {this.props.progressMessage}
        ...
      </div>
    );
  }

  renderExportGeoJsonButton() {
    return (
      <ExportFileButton
        fileName={'route-wizard-' + this.props.fileName}
        geoJson={this.props.geoJson}
      />
    );
  }

  renderExportSpreadsheetButton() {
    return (
      <SpreadsheetExportButton
        columns={this.props.columns}
        rows={this.rows()}
      />
    );
  }

  renderSpreadsheet() {
    return <SpreadsheetTable columns={this.props.columns} rows={this.rows()} />;
  }

  render() {
    return (
      <Layout>
        {this.renderCheckboxes()}
        <div className={this.props.classes.readFileContainer}>
          {this.renderReadFileButton()}
          {this.renderProgressMessage()}
          {this.renderError()}
        </div>
        <div className={this.props.classes.exportButtonsContainer}>
          {this.renderExportGeoJsonButton()}
          {this.renderExportSpreadsheetButton()}
        </div>
        {this.renderSpreadsheet()}
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
  withState('shouldAddElevation', 'setShouldAddElevation', true),
  withState('shouldSort', 'setShouldSort', true),
  withState('shouldStripTitleNumber', 'setShouldStripTitleNumber', true),
  withState('progressMessage', 'setProgressMessage')
);

export default enhance(IndexPage);
