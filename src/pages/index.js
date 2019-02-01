import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import compose from 'recompose/compose';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { withStyles } from '@material-ui/core/styles';

import CaltopoSorter from '../lib/CaltopoSorter';
import ExportFileButton from '../components/exportFileButton';
import Layout from '../components/layout';
import ReadFileButton from '../components/readFileButton';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';
import addElevation from '../lib/addElevation';
import convertToGeoJson from '../lib/convertToGeoJson';
import createSegments from '../lib/createSegments';
import createSpreadsheet from '../lib/createSpreadsheet';
import reverseGeoJson from '../lib/reverseGeoJson';
import withCss from '../components/withCss';
import workAroundCaltopoBug from '../lib/workAroundCaltopoBug';
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
  messagesContainer: {
    display: 'flex',
    marginBottom: 'auto',
    marginLeft: '1em',
    marginTop: 'auto',
  },
  notificationMessageContainer: {
    fontWeight: 800,
  },
  textMessagesContainer: {
    display: 'block',
  },
  progressSpinner: {
    marginBottom: 'auto',
    marginRight: '1em',
    marginTop: 'auto',
  },
  readFileContainer: {
    display: 'flex',
  },
});

// FIXME: Use https://recompose.docsforhumans.com/withhandlers.html

class IndexPage extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    columns: PropTypes.array, // Just the columns that we are displaying.
    error: PropTypes.string,
    fileName: PropTypes.string,
    processedGeoJson: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    notificationMessage: PropTypes.string,
    progressMessage: PropTypes.string,
    rows: PropTypes.array,
    setColumns: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setFileName: PropTypes.func.isRequired,
    setProcessedGeoJson: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setNotificationMessage: PropTypes.func.isRequired,
    setProgressMessage: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setShouldAddElevation: PropTypes.func.isRequired,
    setShouldReverse: PropTypes.func.isRequired,
    setShouldSort: PropTypes.func.isRequired,
    setShouldStripTitleNumber: PropTypes.func.isRequired,
    setUnprocessedGeoJson: PropTypes.func.isRequired,
    shouldAddElevation: PropTypes.bool.isRequired,
    shouldReverse: PropTypes.bool.isRequired,
    shouldSort: PropTypes.bool.isRequired,
    shouldStripTitleNumber: PropTypes.bool.isRequired,
    unprocessedGeoJson: PropTypes.object,
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.unprocessedGeoJson &&
      (prevProps.shouldAddElevation !== this.props.shouldAddElevation ||
        prevProps.shouldReverse !== this.props.shouldReverse ||
        prevProps.shouldSort !== this.props.shouldSort ||
        prevProps.shouldStripTitleNumber !== this.props.shouldStripTitleNumber)
    ) {
      this.reprocessGeoJson();
    }
  }

  // Convert each row from a hash to an array of values.  This also filters
  // out the values for columns that we are not displaying.
  rows() {
    return this.props.rows.map((row) =>
      this.props.columns.map((column) => row[column['key']])
    );
  }

  resetState() {
    this.props.setColumns([]);
    this.props.setError(null);
    this.props.setFileName(null);
    this.props.setIsLoading(false);
    this.props.setNotificationMessage(null);
    this.props.setProcessedGeoJson(null);
    this.props.setProgressMessage(null);
    this.props.setRows([]);
    this.props.setUnprocessedGeoJson(null);
  }

  // Pause a bit after setting the progress message to give us a chance to render.
  msg(data, progressMessage, shouldDoThisStep = true) {
    if (!shouldDoThisStep) {
      return Promise.resolve(data);
    }

    this.props.setProgressMessage(progressMessage + '...');

    return new Promise((resolve) => {
      const timeoutCallback = () => resolve(data);
      const timeoutMs = 500;
      setTimeout(timeoutCallback, timeoutMs);
    });
  }

  handleSelectedFile = (event) => {
    const file = event.target.files[0];
    const fileName = file.name;

    this.resetState();
    this.props.setFileName(fileName);
    this.props.setIsLoading(true);
    this.props.setProgressMessage('Loading file...');

    preadFile({ file })
      .then((fileContentsStr) => this.msg(fileContentsStr, 'Parsing file'))
      .then((fileContentsStr) => {
        const geoJson = convertToGeoJson({ fileContentsStr, fileName });
        this.props.setUnprocessedGeoJson(geoJson);
        this.processGeoJson(geoJson);
      })
      .catch((error) => this.handleError(error));
  };

  reprocessGeoJson() {
    this.props.setIsLoading(true);

    this.processGeoJson(this.props.unprocessedGeoJson);
  }

  processGeoJson(geoJson) {
    this.msg(
      geoJson,
      'Requesting elevation data (this can take a while)',
      this.props.shouldAddElevation
    )
      .then((geoJson) => this.addElevation(geoJson))
      .then((geoJson) =>
        this.msg(geoJson, 'Sorting lines', this.props.shouldSort)
      )
      .then((geoJson) => this.sort(geoJson))
      .then((geoJson) => workAroundCaltopoBug(geoJson))
      .then((geoJson) =>
        this.msg(geoJson, 'Reversing', this.props.shouldReverse)
      )
      .then((geoJson) => this.reverse(geoJson))
      .then((geoJson) => this.msg(geoJson, 'Creating the spreadsheet'))
      .then((geoJson) => this.createSpreadsheet(geoJson))
      .then((spreadsheet) => {
        const { rows, columns } = spreadsheet;

        this.props.setColumns(columns);
        this.props.setProcessedGeoJson(geoJson);
        this.props.setIsLoading(false);
        this.props.setProgressMessage(`Loaded ${this.props.fileName}!`);
        this.props.setRows(rows);
      })
      .catch((error) => this.handleError(error));
  }

  addElevation(geoJson) {
    if (!this.props.shouldAddElevation) {
      return Promise.resolve(geoJson);
    }

    return addElevation({ geoJson }).catch((error) => {
      /* eslint-disable-next-line no-undef, no-console */
      console.error(error);
      this.props.setNotificationMessage(
        'Failed to get data from Elevation Service. Continuing without elevation data.'
      );

      return geoJson;
    });
  }

  sort(geoJson) {
    if (!this.props.shouldSort) {
      return geoJson;
    }

    return new CaltopoSorter({
      geoJson,
      shouldStripTitleNumber: this.props.shouldStripTitleNumber,
    }).sort();
  }

  reverse(geoJson) {
    if (!this.props.shouldReverse) {
      return geoJson;
    }

    return reverseGeoJson(geoJson);
  }

  createSpreadsheet(geoJson) {
    const segments = createSegments(geoJson);

    return createSpreadsheet(segments);
  }

  handleError(error) {
    /* eslint-disable-next-line no-undef, no-console */
    console.error(error);

    this.resetState();
    this.props.setError(error.message || error);
  }

  renderCheckboxes() {
    return (
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldSort}
              color="primary"
              disabled={this.props.isLoading}
              onChange={(_event, value) => this.props.setShouldSort(value)}
            />
          }
          label="Sort segments by their titles."
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldStripTitleNumber}
              color="primary"
              disabled={this.props.isLoading || !this.props.shouldSort}
              onChange={(_event, value) =>
                this.props.setShouldStripTitleNumber(value)
              }
            />
          }
          label="Remove numeric prefixes from segment titles after sorting."
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldReverse}
              color="primary"
              disabled={this.props.isLoading}
              onChange={(_event, value) => this.props.setShouldReverse(value)}
            />
          }
          label="Reverse the route."
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.shouldAddElevation}
              color="primary"
              disabled={this.props.isLoading}
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
        disabled={this.props.isLoading}
      >
        Read GPX, KML or GeoJSON file
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

  renderMessages() {
    return (
      <div className={this.props.classes.messagesContainer}>
        {this.props.isLoading && (
          <CircularProgress
            className={this.props.classes.progressSpinner}
            size={25}
            thickness={7}
          />
        )}
        <div className={this.props.classes.textMessagesContainer}>
          <div className={this.props.classes.notificationMessageContainer}>
            {this.props.notificationMessage}
          </div>
          <div>{this.props.progressMessage}</div>
        </div>
      </div>
    );
  }

  renderExportGeoJsonButton() {
    return (
      <ExportFileButton
        disabled={this.props.isLoading}
        fileName={'route-wizard-' + this.props.fileName}
        geoJson={this.props.processedGeoJson}
      />
    );
  }

  renderExportSpreadsheetButton() {
    return (
      <SpreadsheetExportButton
        columns={this.props.columns}
        disabled={this.props.isLoading}
        rows={this.rows()}
      />
    );
  }

  renderSpreadsheet() {
    return (
      <SpreadsheetTable
        columns={this.props.columns}
        isLoading={this.props.isLoading}
        rows={this.rows()}
      />
    );
  }

  render() {
    return (
      <Layout>
        {this.renderCheckboxes()}
        <div className={this.props.classes.readFileContainer}>
          {this.renderReadFileButton()}
          {this.renderMessages()}
          {this.renderError()}
        </div>
        <div className={this.props.classes.exportButtonsContainer}>
          {this.renderExportSpreadsheetButton()}
          {this.renderExportGeoJsonButton()}
        </div>
        {this.renderSpreadsheet()}
      </Layout>
    );
  }
}

const enhance = compose(
  withCss, // Keep this first.
  withStyles(styles),
  withState('columns', 'setColumns', []),
  withState('error', 'setError'),
  withState('fileName', 'setFileName'),
  withState('processedGeoJson', 'setProcessedGeoJson'),
  withState('isLoading', 'setIsLoading', false),
  withState('unprocessedGeoJson', 'setUnprocessedGeoJson'),
  withState('notificationMessage', 'setNotificationMessage'),
  withState('rows', 'setRows', []),
  withState('shouldAddElevation', 'setShouldAddElevation', true),
  withState('shouldReverse', 'setShouldReverse', true),
  withState('shouldSort', 'setShouldSort', true),
  withState('shouldStripTitleNumber', 'setShouldStripTitleNumber', true),
  withState('progressMessage', 'setProgressMessage')
);

export default enhance(IndexPage);
