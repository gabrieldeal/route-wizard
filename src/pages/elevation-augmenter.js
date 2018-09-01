import compose from 'recompose/compose';
import FormGroup from '@material-ui/core/FormGroup';
import PropTypes from 'prop-types';
import React from 'react';
import withState from 'recompose/withState';
import { preadJson } from '../lib/readFile';
import { withStyles } from '@material-ui/core/styles';

import addElevation from '../lib/addElevation';
import ElevationAugmenterExportButton from '../components/caltopoSorter/exportButton';
import Layout from '../components/layout';
import ReadFileButton from '../components/readFileButton';

const styles = () => ({
  newOrder: {
    paddingTop: '1em',
  },
});

class ElevationAugmenterPage extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    error: PropTypes.string,
    fileName: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    geoJson: PropTypes.string,
    setError: PropTypes.func.isRequired,
    setFileName: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setGeoJson: PropTypes.func.isRequired,
  };

  handleSelectedFile = (event) => {
    this.props.setFileName(null);
    this.props.setGeoJson(null);
    this.props.setIsLoading(true);

    const file = event.target.files[0];
    preadJson({ file })
      .then((geoJson) => {
        this.props.setFileName('elevationed-' + file.name);

        return addElevation({ geoJson: JSON.stringify(geoJson) }); // FIXME
      })
      .then((augmentedGeoJson) => {
        this.props.setGeoJson(augmentedGeoJson);
        this.props.setIsLoading(false);
      })
      .catch((error) => {
        this.props.setError(error.message || error);
        this.props.setIsLoading(false);
      });
  };

  renderWhatIsThisText() {
    return <div>Add elevation to each coordinate in a GeoJSON file.</div>;
  }

  renderInputs() {
    return (
      <FormGroup row>
        <ReadFileButton
          onChange={this.handleSelectedFile}
          isLoading={this.props.isLoading}
        >
          Load route (GeoJSON)
        </ReadFileButton>
      </FormGroup>
    );
  }

  renderExportButton() {
    if (!this.props.geoJson || this.props.isLoading) {
      return null;
    }
    return (
      <ElevationAugmenterExportButton
        fileName={this.props.fileName}
        geoJson={JSON.parse(this.props.geoJson) /* FIXME: pass in string */}
      />
    );
  }

  renderError() {
    return this.props.error && <div>{this.props.error}</div>;
  }

  render() {
    return (
      <Layout
        pageTitle="Elevation Augmenter"
        whatIsThis={this.renderWhatIsThisText()}
      >
        {this.renderInputs()}
        {this.renderExportButton()}
        {this.renderError()}
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

export default enhance(ElevationAugmenterPage);
