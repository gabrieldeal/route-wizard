export default function readFile({ file, receiveFileContents }) {
  const fileReader = new FileReader();
  fileReader.onload = (event) => receiveFileContents(event.target.result);
  fileReader.readAsText(file);
}
