#!/usr/bin/pyhton
# -*- coding: utf-8 -*-
from crawler.items import OmimItem
import re
from scrapy.http import Request
from scrapy.spiders import Spider
from bs4 import BeautifulSoup,element
import os


class OmimSpider(Spider):
    name = 'OmimSpider'  # unique name
    allowed_domains = ['omim.org']
    start_urls = ['https://omim.org']

    def parse(self, response):
        """Loop each OMIM entry list in OMIM number file"""

        # http://omim.org/static/omim/data/mim2gene.txt
        mimnum_filename = f'/home/ubuntu/omim_number.txt'

        with open(mimnum_filename) as mimnum_file:
            for line in mimnum_file:
                if re.match('#', line):
                    continue
                mim_num = line.rstrip().split('\t')[0]  # omim number: e.g. 600185
                url = 'https://omim.org/clinicalSynopsis/' + mim_num  # get OMIM entry
                print (url)
                # HTTP request the URL
                yield Request(url, method='GET', callback=self.parse_content)

    def parse_content(self, response):
        """Parse HTML content"""

        items = OmimcrawlerItem()


        omim_url = response.url
        soup = BeautifulSoup(response.text,'lxml')
        soup2 = BeautifulSoup(response.text,'html.parser')
        title = soup2.find('title')
        title = title.string
        content = soup.prettify()
        omim_number = omim_url.split("/clinicalSynopsis/")[1]
        print (title)

        items['omim_url'] = omim_url
        items['omim_number'] = omim_number
        items['content'] = content
        items['title'] = title

        # df = df.append({'omim_url': items["omim_url"], 'omim_number': items["omim_umber"], 'content': items["content"], 'title': items['title']}, ignore_index=True)

        yield items