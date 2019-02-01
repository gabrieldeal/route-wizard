import Button from '@material-ui/core/Button';
import convertFileNameExtension from '../lib/convertFileNameExtension';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import { saveAs } from 'file-saver/FileSaver';
import { withStyles } from '@material-ui/core/styles';
import * as ConvertFromGeoJson from '../lib/convertFromGeoJson';

import PopupState, {
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/index';

const styles = (theme) => ({
  button: {
    marginBottom: theme.spacing.unit,
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
});

class ExportFileButton extends React.Component {
  exportFile = ({ fileContents, fileExtension }) => {
    var geoJsonBlob = new Blob([fileContents], {
      type: 'application/json;charset=utf-8',
    });
    const fileName = convertFileNameExtension({
      fileName: this.props.fileName,
      newExtension: fileExtension,
    });

    saveAs(geoJsonBlob, fileName);
  };

  exportGeoJson = () => {
    this.exportFile({
      fileContents: JSON.stringify(this.props.geoJson),
      fileExtension: 'json',
    });
  };

  exportGpx = () => {
    this.exportFile({
      fileContents: ConvertFromGeoJson.toGpx(this.props.geoJson),
      fileExtension: 'gpx',
    });
  };

  exportKml = () => {
    this.exportFile({
      fileContents: ConvertFromGeoJson.toGpx(this.props.geoJson),
      fileExtension: 'kml',
    });
  };

  renderButton = (popupState) => {
    const makeHandleClick = (exportFile) => {
      return (event) => {
        popupState.close(event);
        exportFile();
      };
    };

    const disabled =
      this.props.disabled || !(this.props.geoJson && this.props.fileName);

    return (
      <React.Fragment>
        <Button
          {...bindTrigger(popupState)}
          className={this.props.classes.button}
          color="primary"
          disabled={disabled}
          variant="contained"
        >
          Download updated route file
        </Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={makeHandleClick(this.exportGeoJson)}>
            GeoJson
          </MenuItem>
          <MenuItem onClick={makeHandleClick(this.exportGpx)}>GPX</MenuItem>
          <MenuItem onClick={makeHandleClick(this.exportKml)}>KML</MenuItem>
        </Menu>
      </React.Fragment>
    );
  };

  render() {
    return (
      <PopupState variant="popover" popupId="export-file-type-menu">
        {this.renderButton}
      </PopupState>
    );
  }
}

ExportFileButton.propTypes = {
  classes: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  fileName: PropTypes.string,
  geoJson: PropTypes.object,
};

const enhance = withStyles(styles);

export default enhance(ExportFileButton);
