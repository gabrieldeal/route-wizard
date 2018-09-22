import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React from 'react';
import XLSX from 'xlsx';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  button: {
    marginBottom: theme.spacing.unit,
    marginTop: theme.spacing.unit,
  },
});

class ExportButton extends React.Component {
  constructor(props) {
    super(props);

    this.exportFile = this.exportFile.bind(this);
  }

  exportFile() {
    const headerRow = this.props.columns.map((column) => column.name);
    const rows = [headerRow, ...this.props.rows];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Route');

    // generate XLSX file and send to client
    XLSX.writeFile(wb, 'route.xlsx');
  }

  render() {
    return (
      <Button
        className={this.props.classes.button}
        color="primary"
        disabled={!this.props.rows.length}
        onClick={this.exportFile}
        variant="contained"
      >
        Export spreadsheet
      </Button>
    );
  }
}

ExportButton.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

const enhance = withStyles(styles);

export default enhance(ExportButton);
