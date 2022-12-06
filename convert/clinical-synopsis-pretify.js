const fs = require("fs");

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim/${process.env.INPUT_FILE}`

const inputFile = `${process.env.INPUT_FILE}_full.txt`;

const outputFile = `${process.env.INPUT_FILE}_db.json`;


let omimResults = fs.readFileSync(`${folderPath}/${inputFile}`,
    { encoding: "utf8", flag: "r" }
);

omimResults = omimResults
    .split(",\n")
    .filter((omim) => omim != "")
    .map((omim) => {
        omim = JSON.parse(omim);
        let clinical_synopsis = JSON.parse(JSON.stringify(omim));
        delete clinical_synopsis["omimNumber"]
        delete clinical_synopsis["phenoTitle"]
        delete clinical_synopsis["clinicalSynopsis"]
        delete clinical_synopsis["creationDate"]
        delete clinical_synopsis["editHistory"]
        delete clinical_synopsis["omimUrl"]

        clinical_synopsis = JSON.stringify(clinical_synopsis)

        return {
            omim_number: omim.omimNumber,
            name: omim.phenoTitle,
            clinical_synopsis: clinical_synopsis,
            name_2: null,
            description: null
        }
    });

const optionsFile = {
    flags: "w",
    encoding: "utf8",
};

wstream = fs.createWriteStream(`${folderPath}/${outputFile}`,
    optionsFile
);

let wrF = async (line) => {
    wstream.write(line + '\n');
    await new Promise(resolve => setTimeout(resolve, 1));
}

let run = async () => {
    for (omim of omimResults) {
        let line = JSON.stringify(omim);
        await wrF(line);
    }
}

run();
