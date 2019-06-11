import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

console.log('Starting Web Scrape...')

const url = 'https://www.onlyinyourstate.com/states/minnesota/';
const links:Link[] = [];

const promises: Promise<AxiosResponse<any>>[] = [axios.get(url)];

const finalArray:{name: string, url: string, address: string}[] = [];

for (let i = 2; i<=30; i++){
  promises.push(axios.get(`${url}page/${i}/`))
}

console.log('Waiting for promises to resolve...');

const reflect = (promise: Promise<AxiosResponse<any>>) => {
  return promise.then(v => {
    console.log("success!");
    return {status: 'success', data: v.data}
  }).catch(() => {
    console.log("error!");
    return {status: 'error', data: null}
  });
}

Promise.all(promises).then(responses => {
  console.log('Received All Web Data... ');
  responses.map(response => {
    const $ = cheerio.load(response.data);
    $('article a').each((index, link)=>{
      index;
      links.push({title: link.attribs.title, url: link.attribs.href});
    });
  });
  console.log('Starting Web Scrape of Individual Pages... ');
  const pagePromises: Promise<AxiosResponse<any>>[] = [];
  links.map((link) => {
    pagePromises.push(axios.get(link.url, {timeout: 60000}));
  });
  console.log('Waiting for Individual Pages to resolve... ');
  let noAddress = 0;
  let noURL = 0;

  Promise.all(pagePromises.map(reflect)).then(pageResponses =>{
    console.log('Received each page... ');
    const successfulPromises = pageResponses.filter(pageResponse => pageResponse.status === 'success')
    successfulPromises.map(page =>{
        const $ = cheerio.load(page.data);
        let elementsThatContainAddress = $("*:contains(\"Address: \")");
        let captionText = elementsThatContainAddress.text();
        let textArray = captionText.split('Address: ');
        if(textArray.length > 1) {
          console.log(textArray[textArray.length-1].split(".")[0])
          const url = $('meta[property="og:url"]').attr('content');
          console.log(url);
          let name = ""
          if(url.split('/minnesota/').length > 1){
            name = url.split('/minnesota/')[1];
            name = name.slice(0,-3);
            const names = name.split('-');
            name = names.map(thing => {return thing.charAt(0).toUpperCase() + thing.slice(1)}).join(" ");
            console.log(name);
            finalArray.push({
              name,
              url,
              address: textArray[textArray.length-1].split(".")[0]
            })
          } else {
            noURL++;
          }
        } else {
          elementsThatContainAddress = $("*:contains(\"You\'ll find it at: \")");
          captionText = elementsThatContainAddress.text();
          textArray = captionText.split('You\'ll find it at: ');
          if(textArray.length > 1) {
            console.log(textArray[1].split(".\n")[0])
            const url = $('meta[property="og:url"]').attr('content');
            console.log(url);
            let name = ""
            if(url.split('/minnesota/').length > 1){
              name = url.split('/minnesota/')[1];
              name = name.slice(0,-3);
              const names = name.split('-');
              name = names.map(thing => {return thing.charAt(0).toUpperCase() + thing.slice(1)}).join(" ");
              console.log(name);
              finalArray.push({
                name,
                url,
                address: textArray[1].split(". ")[0]
              })
            } else {
              noURL++;
            }
        } else {
          elementsThatContainAddress = $("*:contains(\"is located at \")");
          captionText = elementsThatContainAddress.text();
          textArray = captionText.split('is located at ');
          if(textArray.length > 1) {
            console.log(textArray[1].split(". ")[0])
            const url = $('meta[property="og:url"]').attr('content');
            console.log(url);
            let name = ""
            if(url.split('/minnesota/').length > 1){
              name = url.split('/minnesota/')[1];
              name = name.slice(0,-3);
              const names = name.split('-');
              name = names.map(thing => {return thing.charAt(0).toUpperCase() + thing.slice(1)}).join(" ");
              console.log(name);
              finalArray.push({
                name,
                url,
                address: textArray[1].split(". ")[0]
              })
            } else {
              noURL++;
            }
        } else {
          noAddress++;
        }
      }
    }
    });
    console.log("No url found: ", noURL);
    console.log("No Address found: ", noAddress);
    console.log("Final Array Count", finalArray.length);
    const serializedArray = JSON.stringify(finalArray);
    fs.writeFile('./output.txt', serializedArray, (err) => {
      if(err){
        return console.log(err)
      }
      console.log("File created!")
    })
  }).catch(err => {
    console.log(err);
  });
}).catch(error => {
  console.error(error);
})

interface Link {
  title: string,
  url: string,
}