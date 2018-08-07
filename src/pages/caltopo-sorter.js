import Checkbox from '@material-ui/core/Checkbox';
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
import ReadFileButton from '../components/readFileButton';

const styles = () => ({
  newOrder: {
    paddingTop: '1em',
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

  handleSelectedFile = (event) => {
    this.props.setFileName(null);
    this.props.setGeoJson(null);
    this.props.setIsLoading(true);

    const file = event.target.files[0];
    preadJson({ file })
      .then((geoJson) => {
        this.props.setFileName('sorted-' + file.name);
        this.props.setGeoJson(geoJson);
        this.props.setIsLoading(false);
      })
      .catch((error) => {
        this.props.setError(error.message || error);
        this.props.setIsLoading(false);
      });
  };

  sortGeoJson() {
    if (!this.props.geoJson) {
      return null;
    }

    return new CaltopoSorter({
      geoJson: this.props.geoJson,
      shouldStripTitleNumber: this.props.shouldStripTitleNumber,
    }).sort();
  }

  renderWhatIsThisText() {
    return (
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

  renderExportButton(sortedGeoJson) {
    if (!this.props.geoJson) {
      return null;
    }
    return (
      <CaltopoSorterExportButton
        fileName={this.props.fileName}
        geoJson={sortedGeoJson}
      />
    );
  }

  renderError() {
    return this.props.error && <div>{this.props.error}</div>;
  }

  renderGeoJson = (geoJson) => {
    if (!geoJson) {
      return null;
    }

    const titles = geoJson.features.map((feature) => feature.properties.title);

    return (
      <div className={this.props.classes.newOrder}>
        <Typography variant="subheading">New order</Typography>
        <ol>
          {titles.map((title, index) => (
            <li key={index}>{title}</li>
          ))}
        </ol>
      </div>
    );
  };

  render() {
    const sortedGeoJson = this.sortGeoJson();

    return (
      <Layout
        pageTitle="Caltopo Sorter"
        whatIsThis={this.renderWhatIsThisText()}
      >
        {this.renderInputs()}
        {this.renderExportButton(sortedGeoJson)}
        {this.renderError()}
        {this.renderGeoJson(sortedGeoJson)}
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
