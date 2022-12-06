const fs = require("fs");

const optionsFile = {
    flags: "w",
    encoding: "utf8",
};

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim-genes/${process.env.INPUT_FILE}`

const inputFile = `${process.env.INPUT_FILE}_gene_omim_raw.txt`;

const outputFile = `${process.env.INPUT_FILE}_gene_omim.json`;

const omimNumberFile = `${process.env.INPUT_FILE}_omim_number.txt`;

let omimNumbers = [];

let geneOmimResult = fs.readFileSync(`${folderPath}/${inputFile}`,
    { encoding: 'utf8', flag: 'r' });

geneOmimResult = geneOmimResult.split(',\n').filter(gene => gene != '').map(gene => {
    let g = JSON.parse(gene)
    return {
        gene_omim: g.omimNumber,
        gene_name: g.geneID,
        gene_phenotypes: g.gene_phenotype_relationships
    };
});


let wstream = fs.createWriteStream(`${folderPath}/${outputFile}`, optionsFile);



let wrf = async (line) => {
    wstream.write(line + "\n");
    return await new Promise(resolve => setTimeout(resolve, 1));
}


let wrfOmim = () => {
    let wstreamOmim = fs.createWriteStream(`${folderPath}/${omimNumberFile}`, optionsFile);
    for (let omim of omimNumbers) {
        wstreamOmim.write(omim + "\n");
    }
    wstreamOmim.close();
}

let execute = async () => {
    for (let element of geneOmimResult) {
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

            await wrf(JSON.stringify(result));
        }
    }
    wstream.close();

    // Write omim number file

    wrfOmim();
}


execute();



