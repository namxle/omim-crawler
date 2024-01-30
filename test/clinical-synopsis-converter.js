const fs = require('fs');
const cheerio = require('cheerio');

const readline = require('readline')

const folderPath = `/home/ubuntu/omim-crawler/outputs/result/omim/${process.env.INPUT_FILE}`

const inputFile = `test.json`;

const outputFile = `test_full.txt`;

const optionsFile = {
    flags: 'w',
    encoding: 'utf8'
};

var wstream;

async function execute() {
    let lineReader = readline.createInterface({
        input: fs.createReadStream(`${inputFile}`)
    });

    wstream = fs.createWriteStream(`${outputFile}`, optionsFile);

    for await (const line of lineReader) {
        if (line != '') {
            let omimEntry = JSON.parse(line);
            run(omimEntry);
        }
    }
}

execute();


function trimSpace(stringValue) {
    if (stringValue != '' && stringValue != null) {
        return stringValue.replace(/\s\s+/g, ' ').trim().replace(/\n/g, '');
    }
    return '';
}

function run(data) {

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
                            // console.log(lineContent)
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
                    } else {
                        geneInfo[key1]['subInfo'] = [];
                        var subContent = $($(element).find('> div:nth-child(2) span.mim-font')[0]).contents().filter(function() {
                            return this.type == 'text';
                            }).text();
                        var contentArray = subContent.split(' - ');

                        for (var k in contentArray) {
                            if (trimSpace(contentArray[k]) != '') {
                                geneInfo[key1]['subInfo'].push(trimSpace(contentArray[k]));
                            }
                        }

                        if (geneInfo[key1]['subInfo'].length == 0) {
                            delete geneInfo[key1]['subInfo']
                        }
                        
                    }
                }

            }
        }
    }

    var line = JSON.stringify(geneInfo);

    wstream.write(line + '\n');
}
