import { AxiosResponse } from 'axios';
import fs from "fs";
import { appCode, appId } from "./api";
import axios from './axios';


fs.readFile("./output.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
  }
  const parsedData: Location[] = JSON.parse(data);
  getGeoInformation(parsedData);
});

const promises: Promise<AxiosResponse<any>>[] = [];
const addresses: HereLocation[] = [];

const getGeoInformation = (parsedData: Location[]) => {

  parsedData.forEach(location => {
// tslint:disable-next-line: max-line-length
    const hereMapsURL = `https://geocoder.api.here.com/6.2/geocode.json?app_id=${appId}&app_code=${appCode}&searchtext=${location.address}`;
    promises.push(axios.get(hereMapsURL).then(res =>({...res, Name: location.name, Url: location.url})));
  });

  Promise.all(promises).then(responses => {
    responses.forEach(response => {
      const hereLocation = transformResponse(response);
      if (hereLocation) {
        addresses.push(hereLocation);
      }
    });
    const serializedArray = JSON.stringify(addresses);
    fs.writeFile("./finalLocationOutput.txt", serializedArray, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("File created!");
    });
  });
};

const transformResponse = (res: any) => {
  if (res.data.Response.View.length && res.data.Response.View[0].Result.length) {
    return {...res.data.Response.View[0].Result[0].Location.Address, ...res.data.Response.View[0].Result[0].Location.DisplayPosition, Name: res.Name, Url: res.Url};
  }
  return null;
};


interface Location {
  address: string;
  name: string;
  url: string;
}

interface HereLocation {
  Name: string;
  Url: string;
  Label: string;
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
