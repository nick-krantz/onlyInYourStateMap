"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var promises = [];
var addresses = [];
var getGeoInformation = function (parsedData) {
    parsedData.forEach(function (location) {
        // tslint:disable-next-line: max-line-length
        var hereMapsURL = "https://geocoder.api.here.com/6.2/geocode.json?app_id=" + api_1.appId + "&app_code=" + api_1.appCode + "&searchtext=" + location.address;
        promises.push(axios_1.default.get(hereMapsURL).then(function (res) { return (__assign({}, res, { Name: location.name, Url: location.url })); }));
    });
    Promise.all(promises).then(function (responses) {
        responses.forEach(function (response) {
            var hereLocation = transformResponse(response);
            if (hereLocation) {
                addresses.push(hereLocation);
            }
        });
        console.log(addresses);
    });
};
var transformResponse = function (res) {
    if (res.data.Response.View.length && res.data.Response.View[0].Result.length) {
        return __assign({}, res.data.Response.View[0].Result[0].Location.Address, { Name: res.Name, Url: res.Url });
    }
    return null;
};
