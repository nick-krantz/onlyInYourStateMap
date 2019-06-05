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
var reflect = function (promise) {
    return promise.then(function (v) {
        return { status: 'success', data: v.data };
    }).catch(function () {
        return { status: 'error', data: null };
    });
};
Promise.all(promises).then(function (responses) {
    console.log('Received All Web Data... ');
    responses.map(function (response) {
        var $ = cheerio_1.default.load(response.data);
        $('article a').each(function (index, link) {
            index;
            links.push({ title: link.attribs.title, url: link.attribs.href });
        });
    });
    console.log('Starting Web Scrape of Individual Pages... ');
    var pagePromises = [];
    links.map(function (link, i) {
        if (i > 45) {
            return;
        }
        pagePromises.push(axios_1.default.get(link.url));
    });
    console.log('Waiting for Individual Pages to resolve... ');
    Promise.all(pagePromises.map(reflect)).then(function (pageResponses) {
        console.log('Received each page... ');
        var successfulPromises = pageResponses.filter(function (pageResponse) { return pageResponse.status === 'success'; });
        successfulPromises.map(function (page) {
            var $ = cheerio_1.default.load(page.data);
            var figCaptions = $('figure figcaption');
            var captionText = figCaptions.first().text();
            var textArray = captionText.split('Address: ');
            if (textArray.length > 1) {
                console.log(textArray[1]);
            }
        });
    }).catch(function (err) {
        console.log(err);
    });
}).catch(function (error) {
    console.error(error);
});
