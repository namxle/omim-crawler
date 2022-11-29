import scrapy


class OmimGeneItem(scrapy.Item):
    omim_url = scrapy.Field()
    title = scrapy.Field()
    omim_number = scrapy.Field()
    content = scrapy.Field()
    omim_gene = scrapy.Field()

class OmimItem(scrapy.Item):
    omim_url = scrapy.Field()
    title = scrapy.Field()
    omim_number = scrapy.Field()
    content = scrapy.Field()