package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type CreateWordInput struct {
	Word     string   `json:"word"`
	Tag      string   `json:"tag"`
	Synonyms []string `json:"synonyms"`
}

type CreateSentenceInput struct {
	Sentence    string `json:"sentence"`
	ParagraphID int    `json:"paragraph_id"`
	TemplateID  int    `json:"template_id"`
}

func getDictionaryJSONData(path string) ([]CreateWordInput, error) {
	var data []CreateWordInput

	file, err := os.Open(path)

	if err != nil {
		fmt.Println("Could not open JSON file.")
		return data, err
	}
	defer file.Close()

	jsonData, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println("Could not read JSON file.")
		return data, err
	}

	if err := json.Unmarshal(jsonData, &data); err != nil {
		fmt.Println("Error while trying to unmarshall JSON data.")
		return data, err
	}

	return data, nil
}

func getParagraphJSONData(path string) ([]CreateSentenceInput, error) {
	var data []CreateSentenceInput

	file, err := os.Open(path)

	if err != nil {
		fmt.Println("Could not open JSON file.")
		return data, err
	}
	defer file.Close()

	jsonData, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println("Could not read JSON file.")
		return data, err
	}

	if err := json.Unmarshal(jsonData, &data); err != nil {
		fmt.Println("Error while trying to unmarshall JSON data.")
		return data, err
	}

	return data, nil
}

func req(json []byte, pageUrl string) ([]byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest("POST", pageUrl, bytes.NewBuffer(json))
	if err != nil {
		fmt.Println("Request failed: ", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Request error'd out: ", err)
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return bodyBytes, nil
}

func main() {
	data, err := getDictionaryJSONData("dictionary.json")

	if err != nil {
		fmt.Println("Error getting JSON data: ", err)
		log.Fatal(err)
	}

	dictJson, err := json.Marshal(data)

	if err != nil {
		fmt.Println("Error marshaling JSON data: ", err)
		log.Fatal(err)
	}

	r, err := req(dictJson, "http://localhost:4008/api/word/bulk")

	if err != nil {
		fmt.Println("Error making request: ", err)
		log.Fatal(err)
	}

	fmt.Printf("Request response: +%v\n", string(r))

	paragraphsData, err := getParagraphJSONData("paragraphs.json")

	if err != nil {
		fmt.Println("Error getting JSON data: ", err)
		log.Fatal(err)
	}

	paragraphsJson, err := json.Marshal(paragraphsData)

	if err != nil {
		fmt.Println("Error marshaling JSON data: ", err)
		log.Fatal(err)
	}

	re, err := req(paragraphsJson, "http://localhost:4008/api/sentence")

	if err != nil {
		fmt.Println("Error making request: ", err)
		log.Fatal(err)
	}

	fmt.Printf("Request response: +%v\n", string(re))
}
