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

const getGeoInformation = (parsedData: Location[]) => {

  parsedData.forEach(location => {
// tslint:disable-next-line: max-line-length
    const hereMapsURL = `https://geocoder.api.here.com/6.2/geocode.json?app_id=${appId}&app_code=${appCode}&searchtext=${location.address}`;
    axios.get(hereMapsURL).then(response => {
      const hereLocation = transformResponse(response);
    });
  });
};

const transformResponse = (res: any) => {
  if(res.data.Response.View.length && res.data.Response.View[0].Result.length){
    return res.data.Response.View[0].Result.Location;
  }
  return null;
}


interface Location {
  address: string;
  name: string;
  url: string;
}
