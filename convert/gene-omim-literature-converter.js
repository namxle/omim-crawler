const fs = require("fs");
const cheerio = require("cheerio");
const readline = require("readline");

const folderPath =
  process.env.ENV == "prod"
    ? "/home/ubuntu/omim-crawler/outputs/result/omim-genes" +
      "/" +
      process.env.INPUT_FILE
    : ".";

const entryFile = `${process.env.INPUT_FILE}.json`;

const outputFile = `${process.env.INPUT_FILE}_literature.txt`;

var wstream;

const optionsFile = {
  flags: "w",
  encoding: "utf8",
};

if (!fs.existsSync(`${folderPath}/${entryFile}`)) {
  console.log("File do not exist", `${folderPath}/${entryFile}`);
  process.exit(1);
}

async function execute() {
  let lineReader = readline.createInterface({
    input: fs.createReadStream(`${folderPath}/${entryFile}`),
  });

  wstream = fs.createWriteStream(`${folderPath}/${outputFile}`, optionsFile);

  for await (const line of lineReader) {
    if (line != "") {
      let entry = JSON.parse(line);
      entry.omim_number = entry.omim_number.split("?")[0];
      runExtract(entry.content, entry);
    }
  }
}

execute();

function runExtract(body, geneData) {
  //console.log(body)

  $ = cheerio.load(body);

  var geneInfo = {};

  geneInfo.omimNumber = geneData.omim_number;

  const pubmedIds = [];

  const rows = $("#mimReferencesFold").find("ol li");
  for (var i in rows) {
    if (rows[i] && rows[i].type == "tag") {
      const element = $($(rows[i]).find("div p.mim-text-font"));
      const litInfo = trimSpace(element.text()).split("PubMed: ");

      let pubmedId = ".";
      if (litInfo[1]) {
        const tmp = litInfo[1].split(" ,");
        if (tmp && tmp[0]) {
          pubmedId = tmp[0].trim();
        }
      }
      if (pubmedId != ".") {
        pubmedIds.push(pubmedId);
      }
    }
  }
  geneInfo.pubmedIds = pubmedIds;

  const line = `${geneInfo.omimNumber}\t${geneInfo.pubmedIds}`

  wstream.write(line + "\n");
  return;
}

function trimSpace(stringValue) {
  if (stringValue != "" && stringValue != null) {
    return stringValue.replace(/\s\s+/g, " ").trim().replace(/\n/g, "");
  }
  return "";
}
