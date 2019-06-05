import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';

console.log('Starting Web Scrape...')

const url = 'https://www.onlyinyourstate.com/states/minnesota/';
const links:Link[] = [];

const promises: Promise<AxiosResponse<any>>[] = [axios.get(url)];

for (let i = 2; i<=30; i++){
  promises.push(axios.get(`${url}page/${i}/`))
}

console.log('Waiting for promises to resolve...')

Promise.all(promises).then(responses => {
  console.log('Received Web Data... ')
  responses.map(response => {
    const $ = cheerio.load(response.data)
    $('article a').each((index, link)=>{
      index;
      links.push({title: link.attribs.title, url: link.attribs.href});
    });
  });
  console.log(links.length);
}).catch(error => {
  console.error(error);
})

interface Link {
  title: string,
  url: string,
}