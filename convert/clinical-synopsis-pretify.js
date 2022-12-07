const fs = require("fs");
const readline = require('readline')

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim/${process.env.INPUT_FILE}`

const inputFile = `${process.env.INPUT_FILE}_full.txt`;

const outputFile = `${process.env.INPUT_FILE}_db.json`;

const optionsFile = {
    flags: "w",
    encoding: "utf8",
};

async function execute() {
    let lineReader = readline.createInterface({
        input: fs.createReadStream(`${folderPath}/${inputFile}`)
    });

    var wstream = fs.createWriteStream(`${folderPath}/${outputFile}`, optionsFile);

    for await (const line of lineReader) {
        if (line != '') {
            let omim = JSON.parse(line);
            let clinical_synopsis = JSON.parse(JSON.stringify(omim));

            delete clinical_synopsis["omimNumber"]
            delete clinical_synopsis["phenoTitle"]
            delete clinical_synopsis["clinicalSynopsis"]
            delete clinical_synopsis["creationDate"]
            delete clinical_synopsis["editHistory"]
            delete clinical_synopsis["omimUrl"]

            clinical_synopsis = JSON.stringify(clinical_synopsis)

            let data = {
                omim_number: omim.omimNumber,
                name: omim.phenoTitle,
                clinical_synopsis: clinical_synopsis,
                name_2: null,
                description: null
            }

            wstream.write(JSON.stringify(data) + '\n');
        }
    }

    wstream.close();
}

execute();
