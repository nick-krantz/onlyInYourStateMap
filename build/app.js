"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var cheerio_1 = __importDefault(require("cheerio"));
var fs_1 = __importDefault(require("fs"));
console.log('Starting Web Scrape...');
var url = 'https://www.onlyinyourstate.com/states/minnesota/';
var links = [];
var promises = [axios_1.default.get(url)];
var finalArray = [];
for (var i = 2; i <= 30; i++) {
    promises.push(axios_1.default.get(url + "page/" + i + "/"));
}
console.log('Waiting for promises to resolve...');
var reflect = function (promise) {
    return promise.then(function (v) {
        console.log("success!");
        return { status: 'success', data: v.data };
    }).catch(function () {
        console.log("error!");
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
    links.map(function (link) {
        pagePromises.push(axios_1.default.get(link.url, { timeout: 60000 }));
    });
    console.log('Waiting for Individual Pages to resolve... ');
    var noAddress = 0;
    var noURL = 0;
    Promise.all(pagePromises.map(reflect)).then(function (pageResponses) {
        console.log('Received each page... ');
        var successfulPromises = pageResponses.filter(function (pageResponse) { return pageResponse.status === 'success'; });
        successfulPromises.map(function (page) {
            var $ = cheerio_1.default.load(page.data);
            var elementsThatContainAddress = $("*:contains(\"Address: \")");
            var captionText = elementsThatContainAddress.text();
            var textArray = captionText.split('Address: ');
            if (textArray.length > 1) {
                console.log(textArray[textArray.length - 1].split(".")[0]);
                var url_1 = $('meta[property="og:url"]').attr('content');
                console.log(url_1);
                var name_1 = "";
                if (url_1.split('/minnesota/').length > 1) {
                    name_1 = url_1.split('/minnesota/')[1];
                    name_1 = name_1.slice(0, -3);
                    var names = name_1.split('-');
                    name_1 = names.map(function (thing) { return thing.charAt(0).toUpperCase() + thing.slice(1); }).join(" ");
                    console.log(name_1);
                    finalArray.push({
                        name: name_1,
                        url: url_1,
                        address: textArray[textArray.length - 1].split(".")[0]
                    });
                }
                else {
                    noURL++;
                }
            }
            else {
                elementsThatContainAddress = $("*:contains(\"You\'ll find it at: \")");
                captionText = elementsThatContainAddress.text();
                textArray = captionText.split('You\'ll find it at: ');
                if (textArray.length > 1) {
                    console.log(textArray[1].split(". ")[0]);
                    var url_2 = $('meta[property="og:url"]').attr('content');
                    console.log(url_2);
                    var name_2 = "";
                    if (url_2.split('/minnesota/').length > 1) {
                        name_2 = url_2.split('/minnesota/')[1];
                        name_2 = name_2.slice(0, -3);
                        var names = name_2.split('-');
                        name_2 = names.map(function (thing) { return thing.charAt(0).toUpperCase() + thing.slice(1); }).join(" ");
                        console.log(name_2);
                        finalArray.push({
                            name: name_2,
                            url: url_2,
                            address: textArray[1].split(". ")[0]
                        });
                    }
                    else {
                        noURL++;
                    }
                }
                else {
                    elementsThatContainAddress = $("*:contains(\"is located at \")");
                    captionText = elementsThatContainAddress.text();
                    textArray = captionText.split('is located at ');
                    if (textArray.length > 1) {
                        console.log(textArray[1].split(". ")[0]);
                        var url_3 = $('meta[property="og:url"]').attr('content');
                        console.log(url_3);
                        var name_3 = "";
                        if (url_3.split('/minnesota/').length > 1) {
                            name_3 = url_3.split('/minnesota/')[1];
                            name_3 = name_3.slice(0, -3);
                            var names = name_3.split('-');
                            name_3 = names.map(function (thing) { return thing.charAt(0).toUpperCase() + thing.slice(1); }).join(" ");
                            console.log(name_3);
                            finalArray.push({
                                name: name_3,
                                url: url_3,
                                address: textArray[1].split(". ")[0]
                            });
                        }
                        else {
                            noURL++;
                        }
                    }
                    else {
                        noAddress++;
                    }
                }
            }
        });
        console.log("No url found: ", noURL);
        console.log("No Address found: ", noAddress);
        console.log("Final Array Count", finalArray.length);
        var serializedArray = JSON.stringify(finalArray);
        fs_1.default.writeFile('./output.txt', serializedArray, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("File created!");
        });
    }).catch(function (err) {
        console.log(err);
    });
}).catch(function (error) {
    console.error(error);
});
