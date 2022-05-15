# CDGP-demo

This is the [demo page](https://cdgp-demo.nlpnchu.org/) of 「[CDGP: Automatic Cloze Distractor Generation based on Pre-trained Language Model](https://github.com/AndyChiangSH/CDGP)」

## 💡 How to use?

### Demo page

![](https://i.imgur.com/IOAArOo.gif)

1. Open the [**demo page**](https://cdgp-demo.nlpnchu.org/).
2. Please enter an article or select an example.
3. Click **Confirm**.
4. Highlight some words to be masked.
5. Click **Generate**.
6. Wait a second, then a **stem**, **options** and **answers** will show up below.
7. You can copy the result or download the text or json file.

### API

* Path

https://cdgp-demo.nlpnchu.org/api/

* Request

```
POST {
    stem: <an article with masked word>
}
```

* Response (CORS)

```
JSON {
    stem: <an article with blanks>,
    options: [
        {
            answer: <answer>,
            distractors: [<distractor1>, <distractor2>, <distractor3>],
        },
        ...
    ]
}
```

## 🛠 How to deploy?

1. Pull image from [Docker Hub](https://hub.docker.com/repository/docker/nchunlplab/cdgp-demo) to your device.

```
docker pull nchunlplab/cdgp-demo:latest
```

2. Copy `docker-compose.yml` to your current working directory.

```
version: "3.9"
services:
  cdgp-demo:
    image: nchunlplab/cdgp-demo:latest
    container_name: cdgp-demo
    build: .
    ports:
      - "<YOUR PORT>:5000"
    restart: always

```

3. Run docker-compose.

```
docker-compose up        # front
docker-compose up -d     # backgrond
```

4. If you want to stop container, please use two commands below.

```
docker stop cdgp-demo
docker rm cdgp-demo
```


## 👦 Authors

* Andy Chiang ([@AndyChiangSH](https://github.com/AndyChiangSH))
