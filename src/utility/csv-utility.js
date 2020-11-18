import fs from 'fs';
const csv = require('csvtojson');

export const csvToJson = async (path) => {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(path)
      .then((results) => {
        results = results.map((result) => {
          return { name: result.Name, age: result.Age, sex: result.Sex };
        });

        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }

        resolve(results);
      });
  });
};
