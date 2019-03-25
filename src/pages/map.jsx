import 'leaflet/dist/leaflet.css';
import compose from 'recompose/compose';
import dayjs from '../lib/climate/dayjs';
import DayjsUtils from '@date-io/dayjs';
import debounce from 'lodash/debounce';
import Layout from '../components/layout';
import Leaflet from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import withCss from '../components/withCss';
import { Map, TileLayer } from 'react-leaflet';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { withStyles } from '@material-ui/core/styles';

Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/';

const styles = (theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  datePickerContainer: {
    margin: 0,
    padding: '1em',
  },
  datePickerForm: {
    marginBottom: 0,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

class MapPage extends React.Component {
  state = {
    date: null,
    dimensions: {
      height: 0,
      width: 0,
    },
  };
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  updateDimensionsImmediately = () => {
    var viewportHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    const navbarHeight = document.getElementById('navbar').clientHeight;
    const datePickerHeight = document.getElementById('datePickerContainer')
      .clientHeight;
    const dimensions = {
      width: '100%',
      height: viewportHeight - navbarHeight - datePickerHeight,
    };

    this.setState({ dimensions });
  };
  updateDimensions = debounce(this.updateDimensionsImmediately, 0.3);

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
    window.addEventListener('visibilitychange', this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
    window.removeEventListener('visibilitychange', this.updateDimensions);
  }

  setOuterContainerDiv = (domElement) => (this.outerContainer = domElement);

  handleDatePickerChange = (event) =>
    this.setState({ date: dayjs.utc(event.target.value) });

  // FIXME: Upgrade material-ui so I can use https://material-ui-pickers.dev/api/datepicker
  renderDatePicker() {
    return (
      <div
        id="datePickerContainer"
        className={this.props.classes.datePickerContainer}
      >
        <div>Month & day of climate data (year is required, but ignored):</div>
        <form className={this.props.classes.datePickerForm} noValidate>
          <div>
            <TextField
              id="date"
              type="date"
              onChange={this.handleDatePickerChange}
              className={this.props.classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
        </form>
      </div>
    );
  }

  renderMap() {
    if (this.state.dimensions.height <= 0 || this.state.dimensions.width <= 0) {
      return <div />;
    }

    const mapConfig = {
      // Use https://www.npmjs.com/package/react-geolocated to get the location?
      center: [47.5, -122.0],
      zoom: 8,
    };

    return (
      <div className={this.props.classes.content} style={this.state.dimensions}>
        <Map
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          style={this.state.dimensions}
        >
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
          />
        </Map>
      </div>
    );
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={DayjsUtils}>
        <Layout fullScreen>
          {this.renderDatePicker()}
          {this.renderMap()}
        </Layout>
      </MuiPickersUtilsProvider>
    );
  }
}

const enhance = compose(
  withCss, // Keep this first.
  withStyles(styles)
);

export default enhance(MapPage);
