const fs = require("fs");
const cheerio = require("cheerio");
const readline = require('readline')

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim-genes/${process.env.INPUT_FILE}`

const entryFile = `${process.env.INPUT_FILE}.json`;

const outputFile = `${process.env.INPUT_FILE}_gene_omim_raw.txt`;

var wstream;

const optionsFile = {
	flags: "w",
	encoding: "utf8",
};

if (!fs.existsSync(`${folderPath}/${entryFile}`)) {
    console.log("File do not exist");
    process.exit(1);
}

async function execute () {
    let lineReader = readline.createInterface({
        input: fs.createReadStream(`${folderPath}/${entryFile}`)
    });

    wstream = fs.createWriteStream(`${folderPath}/${outputFile}`, optionsFile);

    for await (const line of lineReader) {
        if (line != '') {
            let entry = JSON.parse(line);
            entry.omim_number = entry.omim_number.split('?')[0];
            runExtract(entry.content, entry);
        }
    }
}

execute();


function runExtract (body, geneData) {
	//console.log(body)

	$ = cheerio.load(body);

	var geneInfo = {};

	geneInfo.omimNumber = geneData.omim_number;
	geneInfo.geneID = geneData.omim_gene;
	geneInfo.mimEntryType = '';

	geneInfo.preferredTitle = trimSpace(
		$("#preferredTitle").parent().find("h3 .mim-font").text()
	);
	geneInfo.alternativeTitles = trimSpace(
		$("#alternativeTitles").parent().find("h4 .mim-font").html()
	);
	geneInfo.includedTitles = trimSpace(
		$("#includedTitles").parent().find(".h4").html()
	);
	geneInfo.approvedGeneSymbols = trimSpace(
		$("#approvedGeneSymbols")
			.parent()
			.find(".mim-text-font strong em")
			.html()
	);
	geneInfo.cytogeneticLocation = trimSpace(
		$("#cytogeneticLocation")
			.parent()
			.find(".mim-text-font strong em")
			.html()
	);

	geneInfo.textFold = trimSpace($("#textFold").find(".mim-text-font").html());
	geneInfo.textFoldText = trimSpace(
		$("#textFold").find(".mim-text-font").text()
	);

	geneInfo.descriptionFold = trimSpace(
		$("#descriptionFold").find(".mim-text-font").html()
	);
	geneInfo.descriptionFoldText = trimSpace(
		$("#descriptionFold").find(".mim-text-font").text()
	);

	geneInfo.cloningFold = trimSpace(
		$("#cloningFold").find(".mim-text-font").html()
	);
	geneInfo.cloningFoldText = trimSpace(
		$("#cloningFold").find(".mim-text-font").text()
	);

	geneInfo.mappingFold = trimSpace(
		$("#mappingFold").find(".mim-text-font").html()
	);
	geneInfo.mappingFoldText = trimSpace(
		$("#mappingFold").find(".mim-text-font").text()
	);

	geneInfo.geneStructureFold = trimSpace(
		$("#geneStructureFold").find(".mim-text-font").html()
	);
	geneInfo.geneStructureFoldText = trimSpace(
		$("#geneStructureFold").find(".mim-text-font ").text()
	);

	geneInfo.geneFunctionFold = trimSpace(
		$("#geneFunctionFold").find(".mim-text-font").html()
	);
	geneInfo.geneFunctionFoldText = trimSpace(
		$("#geneFunctionFold").find(".mim-text-font").text()
	);

	geneInfo.gene_phenotype_relationships = [];

	// Gene Phenotype Relationships
	var geneMap = $("#geneMap").parent().find("table");

	if (geneMap) {
		//console.log('Has Table')

		var rows = geneMap.find("tbody tr");

		//console.log(rows)
		var isFrist = true;

		var location = "";
		for (var i in rows) {
			if (rows[i].type == "tag") {
				var genePhenotype = {
					location: "",
					phenotype: "",
					phenotype_Mim_number: "",
					inheritance: "",
					phenotype_mapping_key: "",
				};

				//console.log(rows[i])

				var element = $(rows[i]);

				if (isFrist) {
					genePhenotype.location = trimSpace(
						element
							.find("td:nth-child(1)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.phenotype = trimSpace(
						element
							.find("td:nth-child(2)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.phenotype_Mim_number = trimSpace(
						element
							.find("td:nth-child(3)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.inheritance = trimSpace(
						element
							.find("td:nth-child(4)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.phenotype_mapping_key = trimSpace(
						element
							.find("td:nth-child(5)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);

					location = genePhenotype.location;

					isFrist = false;
				} else {
					genePhenotype.location = location;
					genePhenotype.phenotype = trimSpace(
						element
							.find("td:nth-child(1)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.phenotype_Mim_number = trimSpace(
						element
							.find("td:nth-child(2)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.inheritance = trimSpace(
						element
							.find("td:nth-child(3)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
					genePhenotype.phenotype_mapping_key = trimSpace(
						element
							.find("td:nth-child(4)")
							.text()
							.replace(/\s\s+/g, " ")
							.trim()
					);
				}

				geneInfo.gene_phenotype_relationships.push(genePhenotype);
			}
		}

		var line = JSON.stringify(geneInfo);

		//console.log(line);
		wstream.write(line + "\n");
        return;
	}
}


function trimSpace(stringValue) {
    if (stringValue != '' && stringValue != null) {
        return stringValue.replace(/\s\s+/g, ' ').trim().replace(/\n/g, '');
    }
    return '';
}

