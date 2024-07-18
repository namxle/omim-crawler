#!/bin/bash

echo "Run scrapy for Omim Pheno"

cd /home/ubuntu/omim-crawler/convert

npm install

cd /home/ubuntu/omim-crawler

echo "Start"

LOG_PATH=/home/ubuntu/omim-crawler/outputs/logs

mkdir -p /home/ubuntu/omim-crawler/outputs/result/omim-pheno/$INPUT_FILE

export STATE=OMIM_PHENO && scrapy crawl OmimPhenoSpider \
    --logfile=$LOG_PATH/omim-pheno/$INPUT_FILE.log
