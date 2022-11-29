#!/bin/bash

LOG_PATH=/home/ubuntu/omim-crawler/outputs/logs

nohup scrapy crawl OmimGeneSpider \
--logfile=$LOG_PATH/$OUTPUT_FILE.log \
> $LOG_PATH/$OUTPUT_FILE.nohup.log 2>&1 &
