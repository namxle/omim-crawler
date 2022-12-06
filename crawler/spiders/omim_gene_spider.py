#!/usr/bin/pyhton
# -*- coding: utf-8 -*-
from crawler.items import OmimGeneItem
import re
import os
from scrapy.http import Request
from scrapy.spiders import Spider
from bs4 import BeautifulSoup


class OmimSpider(Spider):
    name = 'OmimGeneSpider'  # unique name
    allowed_domains = ['omim.org']
    start_urls = ['https://omim.org']

    def parse(self, response):
        """Loop each OMIM entry list in OMIM number file"""

        mimnum_filename = f'/home/ubuntu/omim-crawler/inputs/omim-genes/{os.getenv("INPUT_FILE")}.txt'

        with open(mimnum_filename) as mimnum_file:
            for line in mimnum_file:
                if re.match('#', line):
                    continue
                mim_num = line.rstrip().split('\t')[1]  # omim number: e.g. 600185
                mim_gene = line.rstrip().split('\t')[0]  # omim gene: e.g. ZNF469
                url = 'https://omim.org/entry/' + mim_num + '?search=' + mim_gene   # get OMIM entry
                print (url)
                # HTTP request the URL
                yield Request(url, method='GET', callback=self.parse_content)

    def parse_content(self, response):
        """Parse HTML content"""

        items = OmimGeneItem()


        omim_url = response.url
        soup = BeautifulSoup(response.text,'lxml')
        soup2 = BeautifulSoup(response.text,'html.parser')
        title = soup2.find('title')
        title = title.string
        content = soup.prettify()
        omim_number = omim_url.split("https://omim.org/entry/")[1]
        omim_gene = omim_url.split("?search=")[1]

        print (title)

        items['omim_url'] = omim_url
        items['omim_number'] = omim_number
        items['content'] = content
        items['title'] = title
        items['omim_gene'] = omim_gene

        yield items