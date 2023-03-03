import Realm from 'realm';
import path from 'path';
import fs from 'fs';

const CandlestickSchema = {
    name: `Candlestick`,
    primaryKey: 'time',
    properties: {
        time: 'int',
        open: 'double',
        close: 'double',
        max: 'double',
        min: 'double',
        volume: 'double'
    }
};

const dirPath = 'database';
const outputFolderPath = 'csv/prophet';

// Check if output folder exists
if (fs.existsSync(outputFolderPath)) {
  // If it exists, recursively remove all files and subdirectories
  fs.readdirSync(outputFolderPath).forEach((file) => {
    const filePath = path.join(outputFolderPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // If it's a subdirectory, recursively remove its contents
      removeFolderRecursive(filePath);
    } else {
      // If it's a file, remove it
      fs.unlinkSync(filePath);
    }
  });
} else {
  // If it doesn't exist, create the folder
  fs.mkdirSync(outputFolderPath);
}

function removeFolderRecursive(folderPath) {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // If it's a subdirectory, recursively remove its contents
      removeFolderRecursive(filePath);
    } else {
      // If it's a file, remove it
      fs.unlinkSync(filePath);
    }
  });

  // Remove the empty directory
  fs.rmdirSync(folderPath);
}

fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
  
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const realmFilePath = `${filePath}/${file}.realm`;
      const outputFile = `${outputFolderPath}/${file}.csv`;

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(err);
          return;
        }
  
        if (stats.isDirectory()) {
            const realm = new Realm({ schema: [CandlestickSchema], shouldCompactOnLaunch: () => true , path: realmFilePath});
            const prices = realm.objects('Candlestick').sorted('time'); 

            let data;
            if (filePath.toLowerCase().endsWith("d")) {
              data = prices.map((price) => ({
                ds: formatDateDay(price.time),
                y: price.close,
              }));
            } else {
              data = prices.map((price) => ({
                ds: formatDate(price.time),
                y: price.close,
              }));
            }
            console.log(`Realm ${realmFilePath} size: ${data.length}`);

            console.log();
              // Write the data to a CSV file in the output folder
            const csv = formatCsv(data);
            fs.writeFileSync(outputFile, csv);

            // Close the Realm database
            realm.close();
        }
      });
    });
  });

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

  function formatDateDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function formatCsv(data) {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === 'string' ? `"${value}"` : value))
        .join(',')
    );
    return `${header}\n${rows.join('\n')}`;
  }
