const fs = require("fs");
const readline = require('readline')

const optionsFile = {
    flags: "w",
    encoding: "utf8",
};

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim-genes/${process.env.INPUT_FILE}`

const inputFile = `${process.env.INPUT_FILE}_gene_omim_raw.txt`;

const outputFile = `${process.env.INPUT_FILE}_gene_omim.json`;

const omimNumberFile = `${process.env.INPUT_FILE}_omim_number.txt`;

let omimNumbers = [];


async function run() {
    let lineReader = readline.createInterface({
        input: fs.createReadStream(`${folderPath}/${inputFile}`)
    });

    // Write gene_omim file
    let wstream = fs.createWriteStream(`${folderPath}/${outputFile}`, optionsFile);

    for await (const line of lineReader) {
        if (line != '') {
            let g = JSON.parse(line);

            let element = {
                gene_omim: g.omimNumber,
                gene_name: g.geneID,
                gene_phenotypes: g.gene_phenotype_relationships
            }

            let gene_omim = element.gene_omim;
            let gene_name = element.gene_name;
            for (let pheno of element.gene_phenotypes) {
                let result = {
                    gene_omim: gene_omim,
                    gene_name: gene_name,
                    pheno_omim: pheno.phenotype_Mim_number,
                    pheno_name: pheno.phenotype,
                    location: pheno.location
                }

                // Push omim number
                if (omimNumbers.indexOf(pheno.phenotype_Mim_number) == -1) {
                    omimNumbers.push(pheno.phenotype_Mim_number);
                }

                wstream.write(JSON.stringify(result) + "\n");
            }
        }
    }
    wstream.close();

    // Write file omim
    let wstreamOmim = fs.createWriteStream(`${folderPath}/${omimNumberFile}`, optionsFile);
    for (let omim of omimNumbers) {
        wstreamOmim.write(omim + "\n");
    }
    wstreamOmim.close();
}

run();


