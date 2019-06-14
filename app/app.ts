import axios, { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import cheerio from "cheerio";
import fs from "fs";

console.log("Starting Web Scrape...");

const url = "https://www.onlyinyourstate.com/states/minnesota/";
const links:Link[] = [];

const promises: Promise<AxiosResponse<any>>[] = [axios.get(url)];

const finalArray:{name: string, url: string, address: string}[] = [];
let numberOfSuccesses = 0;
let numberOfErrors = 0;

for (let i = 2; i<=30; i++) {
  promises.push(axios.get(`${url}page/${i}/`));
}

console.log("Waiting for promises to resolve...");

const reflect = (promise: Promise<AxiosResponse<any>>) => {
  return promise.then(v => {
    numberOfSuccesses++;
    console.log("success!")
    return {status: "success", data: v.data};
  }).catch(() => {
    numberOfErrors++;
    console.log("error!")
    return {status: "error", data: null};
  });
};

Promise.all(promises).then(responses => {
  console.log("Received All Web Data... ");
  responses.map(response => {
    const $ = cheerio.load(response.data);
    $("article a").each((index, link)=> {
      index;
      links.push({title: link.attribs.title, url: link.attribs.href});
    });
  });
  console.log("Starting Web Scrape of Individual Pages... ");
  const pagePromises: Promise<AxiosResponse<any>>[] = [];
  links.map((link) => {
    pagePromises.push(axiosInstance.get(link.url, {timeout: 30000}));
  });
  console.log("Waiting for Individual Pages to resolve... ");
  let noAddress = 0;

  Promise.all(pagePromises.map(reflect)).then(pageResponses => {
    console.log("Received each page... ");
    const successfulPromises = pageResponses.filter(pageResponse => pageResponse.status === "success");
    successfulPromises.map(page => {
        const $ = cheerio.load(page.data);
        let elementsThatContainAddress: Cheerio;
        let captionText: string = "";
        let textArray: string[] = []
        if($("*:contains(\"Address: \")").length){
          elementsThatContainAddress = $("*:contains(\"Address: \")").last();
          captionText = elementsThatContainAddress.text();
          textArray = captionText.split("Address: ");

        } else if ($("*:contains(\"You\'ll find it at: \")").length){
          elementsThatContainAddress = $("*:contains(\"You\'ll find it at: \")").last();
          captionText = elementsThatContainAddress.text();
          textArray = captionText.split("You'll find it at: ");

        } else if ($("*:contains(\"is located at \")").length){
          elementsThatContainAddress = $("*:contains(\"is located at \")").last();
          captionText = elementsThatContainAddress.text();
          textArray = captionText.split("is located at ");
        } else if ($("*:contains(\"address is \")").length){
          elementsThatContainAddress = $("*:contains(\"address is \")").last();
          captionText = elementsThatContainAddress.text();
          textArray = captionText.split("address is ");
        }
        
        if(textArray.length > 1) {
          let address = "";
          if (new RegExp("/\.\,/g").test(textArray[textArray.length-1])){
            address = textArray[textArray.length-1].split("\n")[0];
          } else {
            address = textArray[textArray.length-1].split(".")[0];
          }
          const url = $("meta[property=\"og:url\"]").attr("content");
          console.log(url);
          let name = "";
          if(url.split("/minnesota/").length > 1) {
            name = url.split("/minnesota/")[1];
            name = name.slice(0,-3);
            const names = name.split("-");
            name = names.map(thing => {return thing.charAt(0).toUpperCase() + thing.slice(1);}).join(" ");
            console.log(name);
            finalArray.push({
              name,
              url,
              address,
            });
          }
        } else {
          noAddress++;
        }
    });
    console.log("Number of Articles: ", links.length);
    console.log("Number of successes: ", numberOfSuccesses);
    console.log("Number of errors: ", numberOfErrors);
    console.log("No Address found: ", noAddress);
    console.log("Final Array Count", finalArray.length);
    const serializedArray = JSON.stringify(finalArray);
    fs.writeFile("./output.txt", serializedArray, (err) => {
      if(err) {
        return console.log(err);
      }
      console.log("File created!");
    });
  }).catch(err => {
    console.log(err);
  });
}).catch(error => {
  console.error(error);
});

interface Link {
  title: string;
  url: string;
}