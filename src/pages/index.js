import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import compose from 'recompose/compose';
import React from 'react';
import withState from 'recompose/withState';
import { readFile, Route } from 'route-wizard-lib';
import { withStyles } from '@material-ui/core/styles';

import Layout from '../components/layout';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';

function metersToFeet(meters) {
  return meters * 3.28084;
}

function metersToMiles(meters) {
  return meters * 0.000621371;
}

const styles = (theme) => ({
  button: {},
  input: {
    display: 'none',
  },
  spinner: {
    position: 'absolute',
    top: 0,
    left: '50%',
  },
  wrapper: {
    display: 'inline',
    margin: theme.spacing.unit,
    position: 'relative',
  },
});

const IndexPage = (props) => {
  const {
    classes,
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
          setError(error);
          setIsLoading(false);
        });
    };
    readFile({ file, receiveFileContents });
  };

  const columns = [
    { key: 'from', name: 'From' },
    { key: 'to', name: 'To' },
    { key: 'distance', name: 'Distance (mi)' },
    { key: 'gain', name: 'Gain (feet)' },
    { key: 'loss', name: 'Loss (feet)' },
  ];
  const rows = segments
    .map((segment) => ({
      ...segment,
      distance: metersToMiles(segment.distance),
      gain: metersToFeet(segment.gain),
      loss: metersToFeet(segment.loss),
    }))
    .map((segment) => columns.map((column) => segment[column['key']]));

  const haveData = rows.length > 0;

  return (
    <Layout>
      <input
        accept="application/json"
        className={classes.input}
        id="route-file"
        onChange={handleSelectedFile}
        type="file"
      />
      <label htmlFor="route-file">
        <div className={classes.wrapper}>
          <Button
            color="primary"
            variant="contained"
            component="span"
            className={classes.button}
            disabled={isLoading}
          >
            Load route (GeoJSON)
          </Button>
          {isLoading && (
            <CircularProgress size={25} className={classes.spinner} />
          )}
        </div>
      </label>
      {haveData && <SpreadsheetExportButton columns={columns} rows={rows} />}
      {error && <div>{error}</div>}
      {haveData && <SpreadsheetTable columns={columns} rows={rows} />}
    </Layout>
  );
};

const enhance = compose(
  withStyles(styles),
  withState('segments', 'setSegments', []),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false)
);

export default enhance(IndexPage);
