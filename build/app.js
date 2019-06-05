"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var cheerio_1 = __importDefault(require("cheerio"));
console.log('Starting Web Scrape...');
var url = 'https://www.onlyinyourstate.com/states/minnesota/';
var links = [];
var promises = [axios_1.default.get(url)];
for (var i = 2; i <= 30; i++) {
    promises.push(axios_1.default.get(url + "page/" + i + "/"));
}
console.log('Waiting for promises to resolve...');
Promise.all(promises).then(function (responses) {
    console.log('Received Web Data... ');
    responses.map(function (response) {
        var $ = cheerio_1.default.load(response.data);
        $('article a').each(function (index, link) {
            index;
            links.push({ title: link.attribs.title, url: link.attribs.href });
        });
    });
    console.log(links.length);
}).catch(function (error) {
    console.error(error);
});
