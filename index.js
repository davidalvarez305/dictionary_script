import xlsx from "xlsx";

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Unite separated words, capitalize the first letter, and join them.
function transformTag(tag) {
  let result = "";
  const split = tag.split(" ");
  for (let i = 0; i < split.length; i++) {
    result += capitalizeFirstLetter(split[i]);
  }
  return "(#" + result + ")";
}

// Remove braces, white spaces, and push to array
function transformSynonyms(synonym) {
  const re = /(\#)|\(#|(?<=[a-z]+|\.)\)/gm;
  const arr = synonym.map((s) => s.split(re));

  let results = [];

  for (let i = 0; i < arr.length; i++) {
    for (let n = 0; n <= arr[i].length; n++) {
      if (arr[i][n] && !results.includes(arr[i][n]) && arr[i][n].length > 1) {
        results.push(arr[i][n].replace(/\s+/g, " ").trim());
      }
    }
  }
  return results;
}

const main = () => {
  // Open file
  console.log("Reading file...");
  const wb = xlsx.readFile("original.xlsx");

  const dict = xlsx.utils.sheet_to_json(wb.Sheets["Dictionary"]);

  // Create Key-Value Pairs of Words & Synonyms
  let dictionary = [];

  console.log("Transforming data...");
  for (let i = 0; i < dict.length; i++) {
    let row = {};
    row["Tag"] = transformTag(dict[i].Tag);
    row["Synonyms"] = transformSynonyms(dict[i].Variation.split("\n")).join(
      "\n"
    );
    dictionary.push(row);
  }

  // Create workbook
  console.log("Appending JSON to workbook...");
  const data = xlsx.utils.json_to_sheet(dictionary);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, data, "Dictionary");
  const path = "test.xlsx";
  xlsx.writeFile(workbook, path);
};

main();
