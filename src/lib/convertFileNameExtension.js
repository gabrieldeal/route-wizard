function withoutExtension(fileName) {
  const match = /(.+)\.[^.]+$/.exec(fileName);
  if (!match) {
    return fileName;
  }

  return match[1];
}

export default function({ fileName, newExtension }) {
  return withoutExtension(fileName) + '.' + newExtension;
}
