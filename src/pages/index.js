import Button from '@material-ui/core/Button';
import compose from 'recompose/compose';
import React from 'react';
import { readFile, Route } from 'route-wizard-lib';
import withState from 'recompose/withState';
import { withStyles } from '@material-ui/core/styles';

import Layout from '../components/layout';
import SpreadsheetExportButton from '../components/spreadsheet/exportButton';
import SpreadsheetTable from '../components/spreadsheet/table';

const styles = (theme) => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

const IndexPage = (props) => {
  const { classes, segments, setSegments } = props;

  const handleSelectedFile = (event) => {
    const file = event.target.files[0];
    const receiveFileContents = (geoJson) => {
      const route = new Route({ geoJson });
      route.data().then((data) => setSegments(data));
    };
    readFile({ file, receiveFileContents });
  };

  const columns = [
    { key: 'title', name: 'Title' },
    { key: 'distance', name: 'Miles' },
    { key: 'gain', name: 'Gain' },
    { key: 'loss', name: 'Loss' },
  ];
  const rows = segments.map((segment) =>
    columns.map((column) => segment[column['key']])
  );
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
        <Button
          color="primary"
          variant="contained"
          component="span"
          className={classes.button}
        >
          Upload route
        </Button>
      </label>
      {haveData && <SpreadsheetExportButton columns={columns} rows={rows} />}
      {haveData && <SpreadsheetTable columns={columns} rows={rows} />}
    </Layout>
  );
};

const enhance = compose(
  withStyles(styles),
  withState('segments', 'setSegments', [])
);

export default enhance(IndexPage);
