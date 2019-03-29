import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  button: {},
  input: {
    display: 'none',
  },
  wrapper: {
    marginBottom: theme.spacing.unit,
    marginTop: theme.spacing.unit,
  },
});

class ReadFileButton extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    classes: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    variant: PropTypes.string,
  };
  static defaultProps = {
    variant: 'contained',
  };

  render() {
    const { children, classes, disabled, onChange } = this.props;

    const handleChange = (event) => {
      onChange(event);
      event.target.value = null; // Allow the user to upload the same file twice in a row.
    };

    return (
      <React.Fragment>
        <input
          className={classes.input}
          id="route-file"
          onChange={handleChange}
          type="file"
        />
        <label htmlFor="route-file">
          <div className={classes.wrapper}>
            <Button
              color="primary"
              variant={this.props.variant}
              component="span"
              className={classes.button}
              disabled={disabled}
            >
              {children}
            </Button>
          </div>
        </label>
      </React.Fragment>
    );
  }
}

const enhance = withStyles(styles);

export default enhance(ReadFileButton);
