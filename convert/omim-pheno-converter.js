const fs = require('fs');
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
};

const NAS_STRING = '.';

run();

async function run() {
  const fdata = fs
    .readFileSync(options.input, 'utf8')
    .replace(/\r|\r\n|\n/g, '\n')
    .split('\n');

  const results = [];

  for (const line of fdata) {
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
  }

  // console.log(results);

  // Write results
  fs.writeFileSync(options.output, results.join('\n'), 'utf-8');
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
