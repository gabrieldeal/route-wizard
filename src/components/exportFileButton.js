import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React from 'react';
import { saveAs } from 'file-saver/FileSaver';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  button: {
    marginBottom: theme.spacing.unit,
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
});

class ExportFileButton extends React.Component {
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
        color="primary"
        disabled={!(this.props.geoJson && this.props.fileName)}
        onClick={this.exportFile}
        variant="contained"
      >
        Download updated GeoJSON file
      </Button>
    );
  }
}

ExportFileButton.propTypes = {
  classes: PropTypes.object.isRequired,
  fileName: PropTypes.string,
  geoJson: PropTypes.object,
};

const enhance = withStyles(styles);

export default enhance(ExportFileButton);
