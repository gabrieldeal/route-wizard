export function preadFile({ file }) {
  const executor = (resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => resolve(event.target.result);
    fileReader.onerror = (error) => reject(error);
    fileReader.onabort = (error) => reject(error);
    fileReader.readAsText(file);
  };

  return new Promise(executor);
}

export function preadJson({ file }) {
  return preadFile({ file }).then((jsonString) => {
    try {
      return Promise.resolve(JSON.parse(jsonString));
    } catch (e) {
      return Promise.reject(
        `Failed to parse JSON in ${file.name}. Error: ${e.message}.`
      );
    }
  });
}
