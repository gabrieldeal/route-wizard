# route-wizard

Read a GPX, KML or GeoJSON file and then:
* Generate a data book spreadsheet based on the lines & markers.  Example: https://www.yellowleaf.org/routes/greenway-databook/
* Add elevation data.
* Sort the lines from a file.  This is useful for files created on http://caltopo.com

# Demo

http://yellowleaf.org/route-wizard/

# Todo

* Add support for exporting GPX & KML.
* Compute elevation gain more accurately.  Currently it only computes the gain between points in a line, which only works well if there are a lot of points.
* Support folders.
* Non-hacky sorting of segments. https://stackoverflow.com/questions/49883480/combine-a-sequence-of-linestring
