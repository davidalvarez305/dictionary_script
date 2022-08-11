import xlsx from "xlsx";
import axios from "axios";
import fs from "fs";

const main = () => {
  // Open file
  console.log("Reading file...");
  const wb = xlsx.readFile("output.xlsx");

  const dict = xlsx.utils.sheet_to_json(wb.Sheets["Dictionary"]);
  const paragraphs = xlsx.utils.sheet_to_json(wb.Sheets["Paragraphs"]);

  /* console.log("Making dictionary request...");
  function postDictionarty(dict) {
    let url = `http://localhost:4008/api/word/bulk`;
    axios({
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: dict,
    })
      .then((data) => {
        console.log(data);
      })
      .catch(console.error);
  }

  console.log("Making paragraphs request...");
  function postParagraphs(paragraphs) {
    let url = `http://localhost:4008/api/sentences`;
    axios({
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: paragraphs,
    })
      .then((data) => {
        console.log(data);
      })
      .catch(console.error);
  } */

  function cb(err, data) {
    if (err) {
      console.log(err);
    }
    console.log(data);
  }

  fs.writeFile("dictionary.json", JSON.stringify(dict), "utf8", cb);
  fs.writeFile("paragraphs.json", JSON.stringify(paragraphs), "utf8", cb);

  /* postDictionarty(dict);
  postParagraphs(paragraphs); */
};

main();
