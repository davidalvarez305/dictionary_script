import axios from "axios";
import xlsx from "xlsx";

// Compare each substring in a string with each phrase in a dictionarty entry.
function compareStrings(sentence, phrase) {
  const splitSentence = sentence.match(/([A-Za-z0-9]+)/g);
  const splitPhrases = phrase.match(/([A-Za-z0-9]+)/g);

  let matching = [];

  if (splitSentence) {
    for (let i = 0; i < splitSentence.length; i++) {
      if (splitPhrases) {
        for (let n = 0; n < splitPhrases.length; n++) {
          if (
            splitSentence[i].toLowerCase() === splitPhrases[n].toLowerCase() &&
            !matching.includes(splitSentence[i])
          ) {
            matching.push(splitSentence[i]);
          }
        }
      }
    }
  }

  const sentenceLength = splitSentence ? splitSentence.length : 0;
  const percentage = matching.length / sentenceLength;

  return percentage;
}

// Search seach sentence in a paragraph and identify the percentage of which dictionary entry they match with.
function searchForPhrases(paragraph, dict) {
  let par = paragraph;
  const sentences = paragraph.split(".");

  for (let j = 0; j < sentences.length; j++) {
    for (let i = 0; i < dict.length; i++) {
      const phrases = dict[i].synonyms.split("\n");
      for (let n = 0; n < phrases.length; n++) {
        const pctg = compareStrings(sentences[j], phrases[n]);
        if (pctg >= 0.33) {
          const newPar = par.replace(sentences[j], dict[i].tag);
          par = newPar;
          break;
        }
      }
    }
  }
  return par;
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
  return { word: result, tag: "(#" + result + ")" };
}

// Remove braces, white spaces, and push to array
function transformSynonyms(synonym) {
  const matchSynonymsRegex = /((\#)|\(#)([a-zA-Z0-9 ,'"’.;:\-\+]+)(\)(?=))/g;
  const re = /(\#)|\(#|(?<=[a-z]+|\.)\)/gm;
  const arr = synonym.match(matchSynonymsRegex);
  let results = [];

  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      const str = arr[i].split(re)[2];
      if (str && !results.includes(str) && str.length > 1) {
        results.push(str.replace(/\s+/g, " ").trim());
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
    let syns = dict[i].Variation;
    let modifiedTag = "(#" + dict[i].Tag + ")";
    syns += "\n" + modifiedTag.toLowerCase();
    let row = {};
    row["word"] = transformTag(dict[i].Tag).word;
    row["tag"] = transformTag(dict[i].Tag).tag;
    row["synonyms"] = transformSynonyms(syns).join("\n");
    dictionary.push(row);
  }

  // Create workbook
  console.log("Appending JSON to workbook...");
  const data = xlsx.utils.json_to_sheet(dictionary);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, data, "Dictionary");
  const path = "output.xlsx";

  // Start process on sentences.
  const paragraphs = xlsx.utils.sheet_to_json(wb.Sheets["Paragraphs"]);

  let sentences = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const switchedSentences = searchForPhrases(
      paragraphs[i].Paragraph,
      dictionary
    );
    sentences.push({
      paragraph_id: 14,
      sentence: switchedSentences,
      template_id: 1,
    });
  }

  console.log("Appending paragraphs to workbook...");
  const sentencesData = xlsx.utils.json_to_sheet(sentences);
  xlsx.utils.book_append_sheet(workbook, sentencesData, "Paragraphs");
  xlsx.writeFile(workbook, path);
};

main();
