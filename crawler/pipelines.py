# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html

from scrapy.exporters import JsonLinesItemExporter
import os


class CrawlerPipeline(object):
    """结果输出到一个 JSON Line 格式的文件中"""
    def __init__(self):
        self.file = open(f'/home/ubuntu/omim-crawler/outputs/result/{os.getenv("OUTPUT_FILE")}.json', 'wb')
        self.exporter = JsonLinesItemExporter(self.file, ensure_ascii=False, encoding='utf-8')
        self.exporter.start_exporting()

    def open_spider(self, spider):
        pass
        
    def process_item(self, item, spider):
        self.exporter.export_item(item)
        return item

    def close_spider(self, spider):
        self.exporter.finish_exporting()
        self.file.close()