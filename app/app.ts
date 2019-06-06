import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';

console.log('Starting Web Scrape...')

const url = 'https://www.onlyinyourstate.com/states/minnesota/';
const links:Link[] = [];

const promises: Promise<AxiosResponse<any>>[] = [axios.get(url)];

for (let i = 2; i<=30; i++){
  promises.push(axios.get(`${url}page/${i}/`))
}

console.log('Waiting for promises to resolve...');

const reflect = (promise: Promise<AxiosResponse<any>>) => {
  return promise.then(v => {
    return {status: 'success', data: v.data}
  }).catch(() => {
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
  links.map((link, i) => {
    if(i > 45){
      return;
    }
    pagePromises.push(axios.get(link.url));
  });
  console.log('Waiting for Individual Pages to resolve... ');

  Promise.all(pagePromises.map(reflect)).then(pageResponses =>{
    console.log('Received each page... ');
    const successfulPromises = pageResponses.filter(pageResponse => pageResponse.status === 'success')
    successfulPromises.map(page =>{
        const $ = cheerio.load(page.data);
        const figCaptions = $('figure figcaption');
        const captionText = figCaptions.first().text();
        const textArray = captionText.split('Address: ');
        if(textArray.length > 1) {
          console.log(textArray[1]);
          const url = $('meta[property="og:url"]').attr('content');
          console.log(url);
          let name = ""
          if(url.split('/minnesota/').length > 1){
            name = url.split('/minnesota/')[1];
            name = name.slice(0,-3);
            const names = name.split('-');
            name = names.map(thing => {return thing.charAt(0).toUpperCase() + thing.slice(1)}).join(" ");
            console.log(name);
          }
        }
    });
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