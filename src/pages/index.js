import Button from '@material-ui/core/Button';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Layout from '../components/layout';

const styles = (theme) => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

const IndexPage = (props) => {
  const { classes } = props;

  const handleSelectedFile = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      console.log(event.target.result);
    };
    reader.readAsText(file);
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
    </Layout>
  );
};

const enhance = withStyles(styles);

export default enhance(IndexPage);
