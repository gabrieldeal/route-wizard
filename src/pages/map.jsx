import 'leaflet/dist/leaflet.css';
import * as Formatters from '../lib/formatters';
import compose from 'recompose/compose';
import dayjs from '../lib/climate/dayjs';
import DayjsUtils from '@date-io/dayjs';
import daymetClient from '../lib/climate/daymetClient';
import debounce from 'lodash/debounce';
import Layout from '../components/layout';
import Leaflet from 'leaflet';
import Marker from '../components/leaflet/Marker';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import withCss from '../components/withCss';
import { Map, Popup, TileLayer } from 'react-leaflet';
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
  constructor() {
    super();

    const today = dayjs().format('YYYY-MM-DD');

    this.state = {
      defaultDate: today,
      date: today,
      dimensions: {
        height: 0,
        width: 0,
      },
      climateData: null,
    };
  }

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

  handleMapClick = (event) => {
    if (!this.state.date) {
      return; // FIXME: display a message
    }

    const lat = event.latlng.lat;
    const lon = event.latlng.lng; // FIXME: rename 'lon' to 'lng' in all my code?
    const query = {
      date: this.state.date,
      lat, // FIXME: add this to the daymetClient response.
      lon,
    };

    daymetClient({ queries: [query] }).then((data) =>
      this.setState({ climateData: { ...data[0], lat, lng: lon } })
    );
  };

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
              defaultValue={this.state.defaultDate}
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

  renderClimatePopup() {
    if (!this.state.climateData) {
      return null;
    }

    const { date, lat, lng, ...data } = this.state.climateData;
    const position = [lat, lng];
    let content = Object.entries(data).map(([key, value], index) => {
      const typeMapping = Formatters.typeMappings[key];
      const [name, formatter] = typeMapping;

      return (
        <li key={index}>
          {name}: {formatter(value)}
        </li>
      );
    });
    if (content.length === 0) {
      content = 'No data available';
    }

    const dateFormatter = Formatters.typeMappings['date'][1];

    return (
      <Marker key={`${lat} ${lng}`} position={position}>
        <Popup>
          Climate summary for {dateFormatter(date)}:<ul>{content}</ul>
          <p>
            Data source: <a href="https://daymet.ornl.gov/">Daymet</a>
          </p>
        </Popup>
      </Marker>
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
    const attribution =
      'Map data: &copy; ' +
      '<a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors,' +
      ' <a href="http://viewfinderpanoramas.org">SRTM</a>' +
      ' | Map style: &copy; ' +
      '<a href="https://opentopomap.org">OpenTopoMap</a>' +
      ' (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    return (
      <div className={this.props.classes.content} style={this.state.dimensions}>
        <Map
          center={mapConfig.center}
          onClick={this.handleMapClick}
          zoom={mapConfig.zoom}
          style={this.state.dimensions}
        >
          <TileLayer
            url="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution={attribution}
          />
          {this.renderClimatePopup()}
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
