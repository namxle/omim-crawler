const fs = require('fs');
const readline = require('readline');
const cheerio = require('cheerio');
const commander = require('commander');

const program = new commander.Command();

program
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .requiredOption('-f, --input <file-path>', 'Input file path')
  .requiredOption('-o, --output <file-path>', 'Output')
  .parse();

const options = program.opts();

// OMIM URL
const omimUrl = 'https://www.omim.org';

const types = {
  TEXT: 'text',
  LINK: 'link',
  BOLD: 'bold',
};

const NAS_STRING = '.';

run();

async function run() {
  // Create a readable stream from the file
  const fdata = fs.createReadStream('example.txt', 'utf8');

  // Create an interface for reading lines from the file stream
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // Recognize all instances of CR LF ('\r\n') as a single line break
  });

  const results = [];

  // Event listener for when a line is read
  rl.on('line', (line) => {
    if (line) {
      const datum = JSON.parse(line);
      const $ = cheerio.load(datum.content);

      console.log(datum.omim_number);

      // Extract data
      // Extract Description
      const descriptions = [];
      $('#mimDescriptionFold')
        .find('p')
        .each((index, element) => {
          const contents = extractContent($, $(element));
          descriptions.push(contents);
        });

      datum.descriptions = JSON.stringify(descriptions);

      // console.log(descriptions);

      // Extract Clinical Features
      const clinicalFeatures = [];
      $('#mimClinicalFeaturesFold')
        .find('p')
        .each((index, element) => {
          const contents = extractContent($, $(element));
          clinicalFeatures.push(contents);
        });

      // console.log(clinicalFeatures);
      datum.clinicalFeatures = JSON.stringify(clinicalFeatures);

      delete datum.content;
      delete datum.title;

      results.push(
        `${datum.omim_number}\t${datum.descriptions}\t${datum.clinicalFeatures}`
      );
    }
  });

  // Event listener for when the file has been fully read
  rl.on('close', () => {
    console.log('File reading completed.');
    // Write results
    fs.writeFileSync(options.output, results.join('\n'), 'utf-8');
  });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractContent($, element) {
  const contents = [];
  element.contents().each((index, node) => {
    text_value = $(node).text().trim();
    if (node.type === 'text') {
      if (text_value != '') {
        contents.push({
          type: types.TEXT,
          text: text_value,
          value: NAS_STRING,
        });
      }
    } else if (node.tagName === 'a') {
      const href = $(node).attr('href');
      let value = href.indexOf('/entry') == 0 ? `${omimUrl}/${href}` : href;
      if (text_value != '') {
        if (value.indexOf('#') == 0) {
          const tmpTxt = $(value)
            .nextAll('div')
            .first()
            .find('p.mim-text-font');
          const litInfo = trimSpace(tmpTxt.text()).split('PubMed: ');

          let pubmedId = NAS_STRING;
          if (litInfo[1]) {
            const tmp = litInfo[1].split(', ');
            if (tmp && tmp[0]) {
              pubmedId = tmp[0].trim();
            }
          }
          if (pubmedId != NAS_STRING) {
            value = 'https://pubmed.ncbi.nlm.nih.gov' + '/' + pubmedId;
          } else {
            value = NAS_STRING;
          }
        }
        contents.push({
          type: value != NAS_STRING ? types.LINK : types.TEXT,
          text: text_value,
          value: value,
        });
      }
    } else if (node.tagName == 'strong') {
      if (text_value != '') {
        contents.push({
          type: types.BOLD,
          text: text_value,
          value: NAS_STRING,
        });
      }
    } else {
      if (text_value != '') {
        contents.push({
          type: types.TEXT,
          text: text_value,
          value: NAS_STRING,
        });
      }
    }
  });
  return contents;
}

function trimSpace(stringValue) {
  if (stringValue != '' && stringValue != null) {
    return stringValue.replace(/\s\s+/g, ' ').trim().replace(/\n/g, '');
  }
  return '';
}
