import 'leaflet/dist/leaflet.css';
import compose from 'recompose/compose';
import Layout from '../components/layout';
import Leaflet from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import withCss from '../components/withCss';
import { Map, TileLayer } from 'react-leaflet';
import { withStyles } from '@material-ui/core/styles';

Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/';

const styles = {
  mapContainer: { height: 200, width: 200 },
};

class MapPage extends React.Component {
  state = {};
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  renderMap() {
    const mapConfig = {
      // Use https://www.npmjs.com/package/react-geolocated to get the location?
      center: [47.5, -122.0],
      zoom: 8,
    };

    return (
      <div
        className={this.props.classes.mapContainer}
        style={{ height: '600px', width: '300px' }}
      >
        <Map
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          style={{ width: '100%', height: '100%' }}
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
    return <Layout>{this.renderMap()}</Layout>;
  }
}

const enhance = compose(
  withCss, // Keep this first.
  withStyles(styles)
);

export default enhance(MapPage);
