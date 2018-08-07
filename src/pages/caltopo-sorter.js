import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import compose from 'recompose/compose';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import withState from 'recompose/withState';
import { CaltopoSorter } from 'route-wizard-lib';
import { preadJson } from 'route-wizard-lib';
import { withStyles } from '@material-ui/core/styles';

import CaltopoSorterExportButton from '../components/caltopoSorter/exportButton';
import Layout from '../components/layout';

const styles = (theme) => ({
  newOrder: {
    paddingTop: '1em',
  },
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

class CaltopoSorterPage extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    error: PropTypes.string,
    fileName: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    geoJson: PropTypes.object,
    setError: PropTypes.func.isRequired,
    setFileName: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setGeoJson: PropTypes.func.isRequired,
    setShouldStripTitleNumber: PropTypes.func.isRequired,
    shouldStripTitleNumber: PropTypes.bool.isRequired,
  };

  renderGeoJson = (geoJson) => {
    const titles = geoJson.features.map((feature) => feature.properties.title);

    return (
      <div className={this.props.classes.newOrder}>
        <Typography variant="subheading">New order</Typography>
        <Typography variant="body1">
          <ol>
            {titles.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ol>
        </Typography>
      </div>
    );
  };

  render() {
    const {
      classes,
      error,
      isLoading,
      fileName,
      geoJson,
      setError,
      setFileName,
      setIsLoading,
      setGeoJson,
      setShouldStripTitleNumber,
      shouldStripTitleNumber,
    } = this.props;

    const handleSelectedFile = (event) => {
      setGeoJson(null);
      setFileName(null);
      setIsLoading(true);

      const file = event.target.files[0];
      preadJson({ file })
        .then((geoJson) => {
          setFileName('sorted-' + file.name);
          setGeoJson(geoJson);
          setIsLoading(false);
        })
        .catch((error) => {
          setError(error.message || error);
          setIsLoading(false);
        });
    };

    const whatIsThis = (
      <div>
        Rename lines with titles like this:
        <blockquote>
          &quot;1 to first camp&quot;, &quot;1.1 to second camp&quot;, and
          &quot;2 north ridge&quot;
        </blockquote>
        to this:
        <blockquote>
          &quot;1 to first camp&quot;, &quot;2 to second camp&quot; and &quot;3
          north ridge&quot;
        </blockquote>
        That way they display in the correct order in http://caltopo.com.
      </div>
    );

    const sortedGeoJson =
      geoJson &&
      new CaltopoSorter({
        geoJson,
        shouldStripTitleNumber,
      }).sort();

    return (
      <Layout pageTitle="Caltopo Sorter" whatIsThis={whatIsThis}>
        <FormGroup row>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldStripTitleNumber}
                color="primary"
                onChange={(_event, value) => setShouldStripTitleNumber(value)}
              />
            }
            label="Strip ordering numbers from titles"
          />
        </FormGroup>
        {geoJson && (
          <CaltopoSorterExportButton
            fileName={fileName}
            geoJson={sortedGeoJson}
          />
        )}
        {error && <div>{error}</div>}
        {geoJson && this.renderGeoJson(sortedGeoJson)}
      </Layout>
    );
  }
}

const enhance = compose(
  withStyles(styles),
  withState('fileName', 'setFileName'),
  withState('geoJson', 'setGeoJson'),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false),
  withState('shouldStripTitleNumber', 'setShouldStripTitleNumber', false)
);

export default enhance(CaltopoSorterPage);
