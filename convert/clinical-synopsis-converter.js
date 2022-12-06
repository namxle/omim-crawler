const fs = require('fs');
const cheerio = require('cheerio');

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim/${process.env.INPUT_FILE}`

const inputFile = `${process.env.INPUT_FILE}.json`;

const outputFile = `${process.env.INPUT_FILE}_full.txt`;

let omimEntry = fs.readFileSync(`${folderPath}/${inputFile}`,
    { encoding: 'utf8', flag: 'r' });

omimEntry = omimEntry.split('\n').filter(omim => omim != '').map(omim => JSON.parse(omim));

const optionsFile = {
    flags: 'w',
    encoding: 'utf8'
};

wstream = fs.createWriteStream(`${folderPath}/${outputFile}`, optionsFile);

function trimSpace(stringValue) {
    if (stringValue != '' && stringValue != null) {
        return stringValue.replace(/\s\s+/g, ' ').trim().replace(/\n/g, '');
    }
    return '';
}

async function run(data) {

    let body = data.content;

    $ = cheerio.load(body)

    $('.hidden').remove()

    var geneInfo = {};

    // #alertBanner

    geneInfo.omimNumber = data.omim_number;

    geneInfo.omimUrl = data.omim_url;

    geneInfo.phenoTitle = trimSpace($(".hidden-print #mimClinicalSynopsis").parent().find("h3 .mim-font").text());

    geneInfo.clinicalSynopsis = trimSpace($(".hidden-print #mimClinicalSynopsis").html());

    var clinicalElements = $(".hidden-print #mimClinicalSynopsis > div");

    for (var i in clinicalElements) {
        var element = clinicalElements[i];

        if (element.type == 'tag') {
            if ($(element).attr('id') == 'editHistory') {
                geneInfo.editHistory = trimSpace($(element).find(".row:nth-child(1) > div:nth-child(2)").text());
            } else if ($(element).attr('id') == 'creationDate') {
                geneInfo.creationDate = trimSpace($(element).find(".row:nth-child(1) > div:nth-child(2)").text());
            } else if ($(element).attr('id') == 'contributors') {
                geneInfo.contributors = trimSpace($(element).find(".row:nth-child(1) > div:nth-child(2)").text());
            } else {
                var key1 = trimSpace($(element).find('> div:nth-child(1)').text());

                if (key1 != '') {
                    var contents = $(element).find('> div:nth-child(2) em');
                    var checkInfor = false;
                    geneInfo[key1] = {};
                    for (var j in contents) {
                        var content = contents[j];
                        if (content.type == 'tag') {
                            checkInfor = true;
                            var key2 = trimSpace($(content).text());
                            geneInfo[key1][key2] = [];

                            var lineContent = $(content).parent().parent().parent().find('> div:nth-child(2)').text();
                            var contentArray = lineContent.split(' - ');
                            for (var k in contentArray) {
                                if (trimSpace(contentArray[k]) != '') {
                                    geneInfo[key1][key2].push(trimSpace(contentArray[k]));
                                }
                            }

                        }
                    }

                    if (checkInfor == false) {
                        geneInfo[key1] = [];
                        var subContent = $(element).find('> div:nth-child(2)').text();

                        var contentArray = subContent.split(' - ');
                        for (var k in contentArray) {
                            if (trimSpace(contentArray[k]) != '') {
                                geneInfo[key1].push(trimSpace(contentArray[k]));
                            }
                        }
                    }
                }

            }
        }
    }

    var line = JSON.stringify(geneInfo);

    //console.log(line);
    wstream.write(line + ',\n');
    await new Promise(resolve => setTimeout(resolve, 5));
}


let execute = async () => {
    for (let omim of omimEntry) {
        await run(omim);
    }
}

execute();