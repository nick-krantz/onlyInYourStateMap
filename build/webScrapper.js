"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var cheerio_1 = __importDefault(require("cheerio"));
var fs_1 = __importDefault(require("fs"));
var axios_2 = __importDefault(require("./axios"));
console.log("Starting Web Scrape...");
var onlyInYourStateURL = "https://www.onlyinyourstate.com/states/minnesota/";
var links = [];
var promises = [axios_1.default.get(onlyInYourStateURL)];
var finalArray = [];
var numberOfSuccesses = 0;
var numberOfErrors = 0;
for (var i = 2; i <= 30; i++) {
    promises.push(axios_1.default.get(onlyInYourStateURL + "page/" + i + "/"));
}
console.log("Waiting for promises to resolve...");
var reflect = function (promise) {
    return promise.then(function (v) {
        numberOfSuccesses++;
        console.log("success!");
        return { status: "success", data: v.data };
    }).catch(function () {
        numberOfErrors++;
        console.log("error!");
        return { status: "error", data: null };
    });
};
Promise.all(promises).then(function (responses) {
    console.log("Received All Web Data... ");
    responses.map(function (response) {
        var $ = cheerio_1.default.load(response.data);
        $("article a").each(function (index, link) {
            index;
            links.push({ title: link.attribs.title, url: link.attribs.href });
        });
    });
    console.log("Starting Web Scrape of Individual Pages... ");
    var pagePromises = [];
    links.map(function (link) {
        pagePromises.push(axios_2.default.get(link.url, { timeout: 30000 }));
    });
    console.log("Waiting for Individual Pages to resolve... ");
    var noAddress = 0;
    Promise.all(pagePromises.map(reflect)).then(function (pageResponses) {
        console.log("Received each page... ");
        var successfulPromises = pageResponses.filter(function (pageResponse) { return pageResponse.status === "success"; });
        successfulPromises.map(function (page) {
            var $ = cheerio_1.default.load(page.data);
            var elementsThatContainAddress;
            var captionText = "";
            var textArray = [];
            if ($("*:contains(\"Address: \")").length) {
                elementsThatContainAddress = $("*:contains(\"Address: \")").last();
                captionText = elementsThatContainAddress.text();
                textArray = captionText.split("Address: ");
            }
            else if ($("*:contains(\"You\'ll find it at: \")").length) {
                elementsThatContainAddress = $("*:contains(\"You\'ll find it at: \")").last();
                captionText = elementsThatContainAddress.text();
                textArray = captionText.split("You'll find it at: ");
            }
            else if ($("*:contains(\"is located at \")").length) {
                elementsThatContainAddress = $("*:contains(\"is located at \")").last();
                captionText = elementsThatContainAddress.text();
                textArray = captionText.split("is located at ");
            }
            else if ($("*:contains(\"address is \")").length) {
                elementsThatContainAddress = $("*:contains(\"address is \")").last();
                captionText = elementsThatContainAddress.text();
                textArray = captionText.split("address is ");
            }
            if (textArray.length > 1) {
                var address = "";
                if (new RegExp("/\.\,/g").test(textArray[textArray.length - 1])) {
                    address = textArray[textArray.length - 1].split("\n")[0];
                }
                else {
                    address = textArray[textArray.length - 1].split(".")[0];
                }
                var url = $("meta[property=\"og:url\"]").attr("content");
                console.log(url);
                var name_1 = "";
                if (url.split("/minnesota/").length > 1) {
                    name_1 = url.split("/minnesota/")[1];
                    name_1 = name_1.slice(0, -3);
                    var names = name_1.split("-");
                    name_1 = names.map(function (thing) { return thing.charAt(0).toUpperCase() + thing.slice(1); }).join(" ");
                    console.log(name_1);
                    finalArray.push({
                        address: address,
                        name: name_1,
                        url: url,
                    });
                }
            }
            else {
                noAddress++;
            }
        });
        console.log("Number of Articles: ", links.length);
        console.log("Number of successes: ", numberOfSuccesses);
        console.log("Number of errors: ", numberOfErrors);
        console.log("No Address found: ", noAddress);
        console.log("Final Array Count", finalArray.length);
        var serializedArray = JSON.stringify(finalArray);
        fs_1.default.writeFile("./output.txt", serializedArray, function (err) {
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
