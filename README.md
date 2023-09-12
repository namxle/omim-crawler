# OMIM CRAWLER

## I. Introduction

- This repository will crawl the data from the [omim.org](https://www.omim.org/)
- To prevent being banned during web crawling, this will adhere to the guidelines specified in the website's [robots.txt](https://www.omim.org/robots.txt) file, causing a delay of `4 seconds` between downloads.
- You can change that in the [settings](https://github.com/namxle/omim-crawler/blob/main/crawler/settings.py) file. But I <b>recommend not to change it</b> or your ip & ip ranges might be banned.



## II. Prerequisite

- You should have installed [Docker](https://docs.docker.com/engine/install/ubuntu/)

- Prepare a '.txt' file have 2 colums seperate by tab
- The file will be exported from table `gene_clinical_synopsis`
  - The first column is the `gene name`
  - The second column is the `gene_omim`

- Edit the `docker-compose.yml` file and set the `INPUT_FILE` value to your file name
  - For example if your file name is `file.txt` then the value of `INPUT_FILE` should be `file`

- The example file will be placed in folder [examples](https://github.com/namxle/omim-crawler/tree/main/examples)



## III. Run

- Run the below command inside the folder omim-crawler

```
  docker compose up -d
```

- You can view execution logs of the docker container by running:

```
  docker logs -f omim
```


## IV. Outputs

#### 1. Data for table `gene_clinical_synopsis`

- JSON file placed in folder outputs/omim-genes/`YOUR_INPUT_FILE_NAME`_gene_omim.json

Structure: 
```
{ 
  "gene_omim":  String,
  "gene_name":  String,
  "pheno_omim": String,
  "pheno_name": String,
  "location":   String
}
```

#### 2. Data for table `phenotypes`

- JSON file placed in folder outputs/omim/`YOUR_INPUT_FILE_NAME`_db.json

Structure:
```
{
  "omim_number":       String,
  "name":              String,
  "clinical_synopsis": String,
  "name_2":            String,
  "description":       String
}
```



