export default class Marker {
  constructor({ title, description, point }) {
    this.title = title;
    this.description = description;
    this.point = point; // JSTS object
  }
}
