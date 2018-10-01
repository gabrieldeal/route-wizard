# route-wizard

* Sort the lines from a GeoJSON file created on http://caltopo.com
* Generate a data book spreadsheet based on the lines & markers from a GeoJSON file.  Example: https://www.yellowleaf.org/routes/greenway-databook/
* Add elevation data to a GeoJSON file.

# Demo

http://yellowleaf.org/route-wizard/

# Todo

* Add support for exporting GPX & KML.
* Compute elevation gain more accurately.  Currently it only computes the gain between points in a line, which only works well if there are a lot of points.
* Support folders.
* Non-hacky sorting of segments. https://stackoverflow.com/questions/49883480/combine-a-sequence-of-linestring
* Fix CSS flicker on initial load. https://github.com/gatsbyjs/gatsby/issues/5667
