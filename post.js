const main = () => {
  function postDictionarty(dict) {
    let url = `http://localhost:4008/api/word/bulk`;
    axios.post(url, dict, null).then(console.log).catch(console.error);
  }

  function postParagraphs(paragraphs) {
    let url = `http://localhost:4008/api/sentences`;
    axios.post(url, paragraphs, null).then(console.log).catch(console.error);
  }
};

main();
