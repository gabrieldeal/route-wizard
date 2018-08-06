import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import React from 'react';
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
  };

  renderGeoJson = () => {
    const titles = this.props.geoJson.features.map(
      (feature) => feature.properties.title
    );

    return (
      <div className={this.props.classes.newOrder}>
        <h2>New order</h2>
        <ol>
          {titles.map((title, index) => (
            <li key={index}>{title}</li>
          ))}
        </ol>
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
    } = this.props;

    const handleSelectedFile = (event) => {
      setGeoJson(null);
      setFileName(null);
      setIsLoading(true);

      const file = event.target.files[0];
      preadJson({ file })
        .then((geoJson) => {
          setFileName('sorted-' + file.name);
          setGeoJson(new CaltopoSorter({ geoJson }).sort());
          setIsLoading(false);
        })
        .catch((error) => {
          setError(error);
          setIsLoading(false);
        });
    };

    return (
      <Layout pageTitle="Caltopo Sorter">
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
        {geoJson && (
          <CaltopoSorterExportButton fileName={fileName} geoJson={geoJson} />
        )}
        {error && <div>{error}</div>}
        {geoJson && this.renderGeoJson()}
      </Layout>
    );
  }
}

const enhance = compose(
  withStyles(styles),
  withState('fileName', 'setFileName'),
  withState('geoJson', 'setGeoJson'),
  withState('error', 'setError'),
  withState('isLoading', 'setIsLoading', false)
);

export default enhance(CaltopoSorterPage);
