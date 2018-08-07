import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  button: {},
  input: {
    display: 'none',
  },
  spinner: {
    color: 'white',
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

class ReadFileButton extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    classes: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { children, classes, isLoading, onChange } = this.props;

    return (
      <div>
        <input
          accept="application/json"
          className={classes.input}
          id="route-file"
          onChange={onChange}
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
              {children}
            </Button>
            {isLoading && (
              <CircularProgress
                className={classes.spinner}
                size={25}
                thickness={7}
              />
            )}
          </div>
        </label>
      </div>
    );
  }
}

const enhance = withStyles(styles);

export default enhance(ReadFileButton);
