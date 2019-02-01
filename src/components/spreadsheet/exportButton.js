import Button from '@material-ui/core/Button';
import downloadFile from '../../lib/downloadFile';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import XLSX from 'xlsx';
import { withStyles } from '@material-ui/core/styles';

import PopupState, {
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/index';

const styles = (theme) => ({
  button: {
    marginBottom: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit,
  },
});

class ExportButton extends React.Component {
  buildWorksheet() {
    const headerRow = this.props.columns.map((column) => column.name);
    const rows = [headerRow, ...this.props.rows];

    return XLSX.utils.aoa_to_sheet(rows);
  }

  exportXlsx = (workSheet) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, workSheet, 'Route');

    // generate XLSX file and send to client
    XLSX.writeFile(wb, 'route.xlsx');
  };

  exportCsv = (workSheet) => {
    const csv = XLSX.utils.sheet_to_csv(workSheet);

    downloadFile({
      fileContents: csv,
      fileExtension: 'csv',
      fileName: 'route',
    });
  };

  renderButton = (popupState) => {
    const makeHandleClick = (exportFile) => {
      return (event) => {
        popupState.close(event);
        exportFile(this.buildWorksheet());
      };
    };

    const disabled = this.props.disabled || !this.props.rows.length;

    return (
      <React.Fragment>
        <Button
          {...bindTrigger(popupState)}
          className={this.props.classes.button}
          color="primary"
          disabled={disabled}
          variant="contained"
        >
          Download spreadsheet
        </Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={makeHandleClick(this.exportXlsx)}>XLSX</MenuItem>
          <MenuItem onClick={makeHandleClick(this.exportCsv)}>CSV</MenuItem>
        </Menu>
      </React.Fragment>
    );
  };

  render() {
    return (
      <PopupState variant="popover" popupId="export-spreadsheet--menu">
        {this.renderButton}
      </PopupState>
    );
  }
}

ExportButton.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  rows: PropTypes.array.isRequired,
};

const enhance = withStyles(styles);

export default enhance(ExportButton);
