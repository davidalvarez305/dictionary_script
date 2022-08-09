import xlsx from "xlsx";

// Compare each substring in a string with each phrase in a dictionarty entry.
function compareStrings(sentence, phrase) {
  const splitSentence = sentence.split(" ");
  const splitPhrases = phrase.split(" ");

  let matching = [];

  for (let i = 0; i < splitSentence.length; i++) {
    for (let n = 0; n < splitPhrases.length; n++) {
      if (
        splitSentence[i] === splitPhrases[n] &&
        !matching.includes(splitSentence[i])
      ) {
        matching.push(splitSentence[i]);
      }
    }
  }

  const percentage = matching.length / splitSentence.length;
  if (percentage > 0.5) {
    console.log("--------------------------------");
    console.log("splitSentence: ", splitSentence);
    console.log("splitPhrases: ", splitPhrases);
    console.log("percentage: ", percentage);
    console.log("--------------------------------");
  }
  return percentage;
}

// Search seach sentence in a paragraph and identify the percentage of which dictionary entry they match with.
function searchForPhrases(paragraph, dict) {
  let finalSentences = [];
  const sentences = paragraph.split(".");

  for (let j = 0; j < sentences.length; j++) {
    for (let i = 0; i < dict.length; i++) {
      const phrases = dict[i].Synonyms.split("\n");
      for (let n = 0; n < phrases.length; n++) {
        const pctg = compareStrings(sentences[j], phrases[n]);
        if (pctg >= 0.5) {
          finalSentences.push(dict[i].Tag);
          break;
        }
      }
    }
  }
  return finalSentences;
}

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

  // Start process on sentences.
  const paragraphs = xlsx.utils.sheet_to_json(wb.Sheets["Paragraphs"]);

  let sentences = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const switchedSentences = searchForPhrases(
      paragraphs[i].Paragraph,
      dictionary
    );
    sentences.push({
      Number: `Paragraph #${i}`,
      Sentence: switchedSentences.join("."),
    });
  }

  console.log(sentences);

  xlsx.writeFile(workbook, path);
};

main();
