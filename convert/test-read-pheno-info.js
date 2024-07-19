const fs = require('fs');
const data = fs
  .readFileSync('outputs/result/omim-pheno/batch-01/batch-01.final.txt', 'utf8')
  .replace(/\r|\r\n|\n/g, '\n')
  .split('\n')
  .map((datum) => {
    return {
      omim_number: datum.split('\t')[0],
      description: JSON.parse(datum.split('\t')[1]),
      clinical_features: JSON.parse(datum.split('\t')[2]),
    };
  })
  .map((datum) => {
    const dtags = parseText(datum.description);
    const ctags = parseText(datum.clinical_features);
    console.log(dtags);
  });

function parseText(data) {
  return data
    .map((item) => {
      const tags = item
        .filter(
          (element) =>
            element.type == 'link' ||
            element.type == 'text' ||
            element.type == 'bold'
        )
        .map((element, index) => {
          if (element.type == 'text') {
            return `<span>${element.text}</span>`;
          } else if (element.type == 'link') {
            if (element.value != '.') {
              return `<a href="${element.value}">${element.text}</a>`;
            } else {
              return `<span>${element.text}</span>`;
            }
          } else if (element.type == 'bold') {
            return `<strong>${element.text}</strong>`;
          }
        })
        .join('');
      return tags;
    })
    .join('\n<br>\n');
}
