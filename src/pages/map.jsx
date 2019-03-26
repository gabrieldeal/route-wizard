import 'leaflet/dist/leaflet.css';
import * as Formatters from '../lib/formatters';
import CircularProgress from '@material-ui/core/CircularProgress';
import compose from 'recompose/compose';
import convertToGeoJson from '../lib/convertToGeoJson';
import dayjs from '../lib/climate/dayjs';
import DayjsUtils from '@date-io/dayjs';
import daymetClient from '../lib/climate/daymetClient';
import debounce from 'lodash/debounce';
import Layout from '../components/layout';
import Leaflet from 'leaflet';
import Marker from '../components/leaflet/Marker';
import PropTypes from 'prop-types';
import React from 'react';
import ReadFileButton from '../components/readFileButton';
import TextField from '@material-ui/core/TextField';
import withCss from '../components/withCss';
import { GeoJSON, Map, Popup, TileLayer } from 'react-leaflet';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { preadFile } from '../lib/readFile';
import { withStyles } from '@material-ui/core/styles';

if (typeof window !== 'undefined') {
  Leaflet.Icon.Default.imagePath =
    '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/';
}

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
    display: 'inline',
    marginBottom: 0,
  },
  progressSpinner: {
    marginBottom: 'auto',
    marginRight: '1em',
    marginTop: 'auto',
  },
  readFileButtonContainer: {
    display: 'inline-block',
    verticalAlign: 'bottom',
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
      isLoading: false,
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

  // FIXME: Share this?
  msg(data, progressMessage) {
    this.setState({ progressMessage: progressMessage + '...' });

    return new Promise((resolve) => {
      // Pause a bit after setting the progress message to give us a chance to render.
      const timeoutCallback = () => resolve(data);
      const timeoutMs = 500;
      setTimeout(timeoutCallback, timeoutMs);
    });
  }

  handleDatePickerChange = (event) =>
    this.setState({ date: dayjs.utc(event.target.value) });

  handleMapClick = (event) => {
    if (!this.state.date) {
      return; // FIXME: display a message
    }

    const lat = event.latlng.lat;
    const lon = event.latlng.lng; // FIXME: rename 'lon' to 'lng' in all my code?
    this.setState({ climateData: null, position: { lat, lng: lon } });

    const query = {
      date: this.state.date,
      lat,
      lon,
    };

    daymetClient({ queries: [query] }).then((data) =>
      this.setState({ climateData: { ...data[0] } })
    );
  };

  handleError(errorMessage) {
    this.setState({ errorMessage, isLoading: false });
  }

  handleSelectedFile = (event) => {
    const file = event.target.files[0];
    const fileName = file.name;

    this.setState({ geoJson: null, isLoading: true });

    this.msg(file, 'Reading file')
      .then((file) => preadFile({ file }))
      .then((fileContentsStr) => this.msg(fileContentsStr, 'Parsing file'))
      .then((fileContentsStr) => {
        const geoJson = convertToGeoJson({ fileContentsStr, fileName });
        this.setState({ geoJson, isLoading: false, progressMessage: null });
      })
      .catch((error) => this.handleError(error));
  };

  // FIXME: Upgrade material-ui so I can use https://material-ui-pickers.dev/api/datepicker
  renderDatePicker() {
    return (
      <div
        id="datePickerContainer"
        className={this.props.classes.datePickerContainer}
      >
        <h1>North American Climate Data</h1>
        Click the map to get historic climate statistics for that location on
        the 20-day time period centered on the selected day & month (the year is
        not used).
        <form className={this.props.classes.datePickerForm} noValidate>
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
        </form>
        {this.renderReadRouteFileButton()}
      </div>
    );
  }

  renderReadRouteFileButton() {
    return (
      <div className={this.props.classes.readFileButtonContainer}>
        <ReadFileButton
          className={this.props.classes.readFileButton}
          disabled={this.state.isLoading}
          errorMessage={this.state.errorMessage}
          isLoading={this.state.isLoading}
          notificationMessage={this.state.notificationMessage}
          onChange={this.handleSelectedFile}
          progressMessage={this.state.progressMessage}
        >
          Read route file
        </ReadFileButton>
      </div>
    );
  }

  renderClimatePopupText() {
    if (!this.state.climateData) {
      return (
        <CircularProgress
          className={this.props.classes.progressSpinner}
          size={25}
          thickness={7}
        />
      );
    }

    const { date, ...data } = this.state.climateData;
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
      return 'No data available';
    }

    const dateFormatter = Formatters.typeMappings['date'][1];

    return (
      <div>
        Climate summary for {dateFormatter(date)}:<ul>{content}</ul>
        <p>
          Data source: <a href="https://daymet.ornl.gov/">Daymet</a>
        </p>
      </div>
    );
  }

  renderClimatePopup() {
    if (!this.state.position) {
      return null;
    }

    const { lat, lng } = this.state.position;
    const position = [lat, lng];

    return (
      <Marker key={`${lat} ${lng}`} position={position}>
        <Popup>{this.renderClimatePopupText()}</Popup>
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
          {this.state.geoJson && <GeoJSON data={this.state.geoJson} />}
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
