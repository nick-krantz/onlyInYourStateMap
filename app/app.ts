import fs from "fs";

fs.readFile("./output.txt", "utf8", (err, data) => {
  if(err){
    console.error(err);
  }
  const parsedData: Location[] = JSON.parse(data);
  getGeoInformation(parsedData);
});

const getGeoInformation = (parsedData: Location[]) => {
  parsedData.forEach(location => {
    console.log(location.name);
  });
}


interface Location {
  address: string;
  name: string;
  url: string;
}
