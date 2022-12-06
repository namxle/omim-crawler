#!/bin/bash

cd /home/ubuntu/omim-crawler/convert

npm install

echo "Start"

LOG_PATH=/home/ubuntu/omim-crawler/outputs/logs

# Create directories
mkdir -p /home/ubuntu/omim-crawler/outputs/result/omim-genes/$INPUT_FILE
mkdir -p /home/ubuntu/omim-crawler/outputs/result/omim/$INPUT_FILE

echo "Run scrapy for Omim Gene"

scrapy crawl OmimGeneSpider \
--logfile=$LOG_PATH/omim-genes/$INPUT_FILE.log

echo "Convert Omim Gene"

node convert/gene-omim-converter.js

node convert/gene-omim-full-converter.js

echo "Move omim number input file"

mv /home/ubuntu/omim-crawler/outputs/result/omim-genes/$INPUT_FILE/"$INPUT_FILE"_omim_number.txt \
/home/ubuntu/omim-crawler/inputs/omim/$INPUT_FILE.txt

echo "Done Omim Gene"

echo "Run scrapy for Omim Number"

scrapy crawl OmimSpider \
--logfile=$LOG_PATH/omim/$INPUT_FILE.log

node convert/clinical-synopsis-converter.js

node convert/clinical-synopsis-pretify.js

echo "Done Omim Number"