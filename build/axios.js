"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var maxRequestCount = 10;
var intervalMS = 20;
var pendingRequests = 0;
var axiosInstance = axios_1.default.create({});
axiosInstance.interceptors.request.use(function (config) {
    return new Promise(function (resolve) {
        var interval = setInterval(function () {
            if (pendingRequests < maxRequestCount) {
                pendingRequests++;
                clearInterval(interval);
                resolve(config);
            }
        }, intervalMS);
    });
});
axiosInstance.interceptors.response.use(function (response) {
    pendingRequests = Math.max(0, pendingRequests - 1);
    return Promise.resolve(response);
}, function (error) {
    pendingRequests = Math.max(0, pendingRequests - 1);
    return Promise.reject(error);
});
exports.default = axiosInstance;
