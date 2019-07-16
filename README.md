# onlyInYourStateMap

[OnlyInYourState](https://www.onlyinyourstate.com) is a website that curates unique things to do in your respective state. Things to do range from nature, attractions, dining and random activities. Whenever I would clicking through Minnesota, I would just have to guess at where things were. A limitation of the website is there isn't a map or being able to sort by distance from a zip code. Those features would make it easy to find things to do based on your location or how far you'd want to commit to traveling. 

So I set out to make one, from the information I could gather directly from the website. I have always wanted to dabble in web scrapping but never really had a reason to do so, luckily for me, this would be that time. Each state has pages of articles that theoretically I should be able write a Node application to grab one by one, parse the data on the page, pull addresses and then plot to a map. 

## WebScrapper.ts

When first looking at the website, their URL structure is based on incrementing the page number like: ```www.onlyinyourstate.com/states/minnesota/page/2/```, which makes it easy to grab each page of attractions. In total, Minnesota has 31 pages of attractions. Once I have the html of each page, I need to parse that to grab each link to the attraction. By inspecting a page, I can see that each attraction use an article tag and directly inside of it, there is an anchor tag with a link to the attraction page and a title for that attraction. So using [Axios](https://github.com/axios/axios), I am able to first grab each of the 31 pages. In order to parse the html that was returned I found [Cheerio](https://github.com/cheeriojs/cheerio), which is an implementation of jQuery for Node. For all 31 pages, that returned 1495 articles, which is an impressive number. 

But now fetching 1495 individual pages comes with its own challenges. I kept running to Socket Closed or Timeout errors when I was attempting to grab each individual page. It didn't take long for me to realize that it was probably my issue with Axios and OnlyInYourState that I was sending 1495 requests almost simultaneously. I needed a way to limit the amount of requests I was sending at a time, wait for those to respond, then process and send more until I had all of the information I needed. Luckily, I found a [great medium article](https://medium.com/@matthew_1129/axios-js-maximum-concurrent-requests-b15045eb69d0) about doing just that. I was able to successfully limit the number of requests to 10 and every 20 ms, check for responses process and send another if able. 

Parsing the individual attraction was difficult because there isn't a stand set for those uploading these attractions of formatting (or if they even have to have an address). I could parse the entire page with a regular expression, but I didn't think that would be the most accurate and could result in false positives. After manually going through some pages, I found some hope: some pages have "Address: address here." in the captions of images or the in the text on the page. A starting point! With a little more digging I found some variations of that like: "is located at", "address is", or "You'll find it at". Using those phrases, I was able to establish some sort of location for the attractions. I was only able to match on 363 attractions (24%) out of the total 1495. I ended up saving those locations as a json in a text file 

## App.ts

I wanted to verify that the addresses from webscraping would resolve into actual locations, using [HERE](https://developer.here.com/) geocoding. I could query those locations and retrieve valid street addresses and latitude and longitude in order to plot these points on a map. At this point each location was an object like so:

```javascript
interface HereLocation {
  Name: string; // Name and Url from web scraping
  Url: string;
  Label: string; // below returned from HERE
  Country: string;
  State: string;
  County: string;
  City: string;
  Street: string;
  HouseNumber: string;
  PostalCode: string;
  Latitude: number;
  Longitude: number;
}
```
Out of the 363, only 310 returned valid locations from HERE. Which turned my running total to only 21% success rate, not most successful project I've attempted, but it would take me a long time to visit 310 places anyway. Then using the same process so I didn't have to call the HERE APIs every time I worked on this project. I once again saved these to a text file to be consumed by a front end.

## index.html

Using the the Google Maps API, I read in each object from the text file and create a marker, with an info window on the map. A fun part about this is that Google has switched up their developer APIs because I only had one call per day for free. Not wanting to have to only get one chance a day, I was able to generate the objects and map without calling Google API until I was sure they were correct. Then I was surprised that I had plots all over the map. 15 outside of North America, and 40 within North America but not in Minnesota, that means that all in total 255 of the attractions actually made it to their correct locations in Minnesota.. an eye popping 17%.

## Where it could have gone wrong

``` // TODO ```