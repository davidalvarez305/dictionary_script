package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type CreateWordInput struct {
	Word     string `json:"word"`
	Tag      string `json:"tag"`
	Synonyms string `json:"synonyms"`
}

func getJsonData(path string) ([]CreateWordInput, error) {
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

func main() {
	client := &http.Client{}

	data, err := getJsonData("dictionary.json")

	if err != nil {
		fmt.Println("Request failed: ", err)
		log.Fatal(err)
	}

	json, err := json.Marshal(data)

	if err != nil {
		fmt.Println("Request failed: ", err)
		log.Fatal(err)
	}

	req, err := http.NewRequest("POST", "http://localhost:4008/api/word/bulk", bytes.NewBuffer(json))
	if err != nil {
		fmt.Println("Request failed: ", err)
		log.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error while getting auth token", err)
		log.Fatal(err)
	}
	defer resp.Body.Close()
}
