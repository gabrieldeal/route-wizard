import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React from 'react';
import { saveAs } from 'file-saver/FileSaver';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  button: {
    margin: theme.spacing.unit,
  },
});

class ExportButton extends React.Component {
  exportFile = () => {
    const geoJsonString = JSON.stringify(this.props.geoJson);
    var geoJsonBlob = new Blob([geoJsonString], {
      type: 'application/json;charset=utf-8',
    });

    saveAs(geoJsonBlob, this.props.fileName);
  };

  render() {
    return (
      <Button
        className={this.props.classes.button}
        disabled={!this.props.geoJson}
        onClick={this.exportFile}
        variant="contained"
      >
        Export sorted GeoJSON file
      </Button>
    );
  }
}

ExportButton.propTypes = {
  classes: PropTypes.object.isRequired,
  fileName: PropTypes.string.isRequired,
  geoJson: PropTypes.object.isRequired,
};

const enhance = withStyles(styles);

export default enhance(ExportButton);
