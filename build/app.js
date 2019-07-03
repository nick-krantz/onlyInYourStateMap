"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var api_1 = require("./api");
var axios_1 = __importDefault(require("./axios"));
fs_1.default.readFile("./output.txt", "utf8", function (err, data) {
    if (err) {
        console.error(err);
    }
    var parsedData = JSON.parse(data);
    getGeoInformation(parsedData);
});
var getGeoInformation = function (parsedData) {
    parsedData.forEach(function (location) {
        // tslint:disable-next-line: max-line-length
        var hereMapsURL = "https://geocoder.api.here.com/6.2/geocode.json?app_id=" + api_1.appId + "&app_code=" + api_1.appCode + "&searchtext=" + location.address;
        axios_1.default.get(hereMapsURL).then(function (response) {
            console.log(response);
        });
    });
};
