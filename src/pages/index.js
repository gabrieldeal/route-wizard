import Button from '@material-ui/core/Button';
import React from 'react';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import { withStyles } from '@material-ui/core/styles';

import Layout from '../components/layout';
import readFile from '../lib/readFile';
import Route from '../lib/Route';

const styles = (theme) => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

const IndexPage = (props) => {
  const { classes, lines, setLines } = props;

  const handleSelectedFile = (event) => {
    const file = event.target.files[0];
    const receiveFileContents = (geoJson) => {
      const route = new Route({ geoJson });
      setLines(route.data());
    };
    readFile({ file, receiveFileContents });
  };

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
      <ol>
        {lines.map((line) => (
          <li key={line.title}>
            {line.title} ({line.points.join(', ')})
          </li>
        ))}
      </ol>
    </Layout>
  );
};

const enhance = compose(
  withStyles(styles),
  withState('lines', 'setLines', [])
);

export default enhance(IndexPage);
