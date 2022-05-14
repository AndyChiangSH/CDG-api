import nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
from flask import Flask, render_template, request
from flask_cors import cross_origin
import re
import os
import json
import numpy as np
from transformers import BertTokenizer, BertForMaskedLM, pipeline
import fasttext

CSG_MODEL_NAME = "BERT_CLOTH_model"
PRETRAIN_MODEL_NAME = "bert-base-uncased"
DS_MODEL_NAME = "wiki_en_ft_model01.bin"
TOP_K = 10
STOP_WORDS = ["[MASK]", "[SEP]", "[PAD]", "[CLS]"]
WEIGHT = {"s0": 0.6, "s1": 0.15, "s2": 0.15, "s3": 0.1}

# load CSG model
csg_model_path = os.path.join("./models/CSG/", CSG_MODEL_NAME)
print(f"Load CSG model at {csg_model_path}...")
csg_model = BertForMaskedLM.from_pretrained(csg_model_path)
tokenizer = BertTokenizer.from_pretrained(PRETRAIN_MODEL_NAME)
# create unmasker
unmasker = pipeline('fill-mask', tokenizer=tokenizer, model=csg_model, top_k=TOP_K)

# load DS model
ds_model_path = os.path.join("./models/DS/", DS_MODEL_NAME)
print(f"Load DS model at {ds_model_path}...")
ds_model = fasttext.load_model(ds_model_path)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/", methods=["GET", "POST"])
@cross_origin()
def api():
    if request.method == "GET":
        return "API OK!"
    else:
        stem = request.values["stem"]
        sents = nltk.sent_tokenize(stem)

        dis_results = list()
        for sent in sents:
            blanks = re.findall("\[.*?\]", sent)
            for i, answer in enumerate(blanks):
                sent_temp = sent
                for j, blank in enumerate(blanks):
                    if i == j:
                        sent_temp = sent_temp.replace(blank, "[MASK]", 1)
                    else:
                        sent_temp = sent_temp.replace(blank, blank[1:-1], 1)
                
                answer = answer[1:-1]
                sent_temp += " [SEP] " + answer
                # print(sent_temp)
                distractors = generate_dis(unmasker, ds_model, sent_temp, answer)
                dis_result = {"distractors": distractors, "answer": answer}
                dis_results.append(dis_result)
        
        blanks = re.findall("\[.*?\]", stem)
        for i, blank in enumerate(blanks):
            stem = stem.replace(blank, f"__{i+1}__", 1)
            
        data = {
            "stem": stem,
            "options": dis_results,
        }
        
        # print(json.dumps(data))
        return json.dumps(data)


def generate_dis(unmasker, ds_model, sent, answer):
    target_sent = sent + " [SEP] " + answer
    # print(target_sent)

    cs = list()
    for cand in unmasker(target_sent):
        word = cand["token_str"].replace(" ", "")
        if len(word) > 1 and word not in STOP_WORDS and word != answer:  # skip stop words
            cs.append(
                {"word": word, "s0": cand["score"], "s1": 0.0, "s2": 0.0, "s3": 0.0})

    # 0.模型信心分數
    s0s = [c["s0"] for c in cs]
    new_s0s = min_max_y(s0s)

    for i, c in enumerate(cs):
        # print(c["word"], new_s0s[i])
        c["s0"] = new_s0s[i]

    # 1.單字相似度
    answer_vector = ds_model.get_word_vector(answer)

    word_similarities = list()
    for c in cs:
        c_vector = ds_model.get_word_vector(c["word"])
        word_similarity = similarity(answer_vector, c_vector)
        word_similarities.append(word_similarity)

    new_similarities = min_max_y(word_similarities)

    for i, c in enumerate(cs):
        c["s1"] = 1-new_similarities[i]

    # 2.句子相似度
    # 依據訓練過後的BERT所生成選項放入句子做比較
    correct_sent = sent.replace('[MASK]', answer)
    correct_sent_vector = ds_model.get_sentence_vector(correct_sent)

    cand_sents = list()
    for c in cs:
        cand_sents.append(sent.replace('[MASK]', c["word"]))

    sent_similarities = list()
    # 兩句子距離
    for cand_sent in cand_sents:
        cand_sent_vector = ds_model.get_sentence_vector(cand_sent)
        sent_similarity = similarity(correct_sent_vector, cand_sent_vector)
        sent_similarities.append(sent_similarity)

    new_similarities = min_max_y(sent_similarities)
    for i, c in enumerate(cs):
        c["s2"] = 1-new_similarities[i]

    # 3.詞性相似度
    origin_token = nltk.word_tokenize(sent)
    origin_token.remove("[")
    origin_token.remove("]")

    mask_index = origin_token.index("MASK")
    correct_token = nltk.word_tokenize(correct_sent)
    correct_pos = nltk.pos_tag(correct_token)
    answer_pos = correct_pos[mask_index]
    for i, c in enumerate(cs):
        cand_sent_token = nltk.word_tokenize(cand_sents[i])
        cand_sent_pos = nltk.pos_tag(cand_sent_token)
        cand_pos = cand_sent_pos[mask_index]

        if cand_pos[1] == answer_pos[1]:
            c["s3"] = 1.0
        else:
            c["s3"] = 0.0

    # 加上權重 (final score)
    cs_rank = list()
    for c in cs:
        fs = WEIGHT["s0"]*c["s0"] + WEIGHT["s1"]*c["s1"] + WEIGHT["s2"]*c["s2"] + WEIGHT["s3"]*c["s3"]
        cs_rank.append((c["word"], fs))

    # sort by final score
    cs_rank.sort(key=lambda x: x[1], reverse=True)

    # Top 3
    result = [d[0] for d in cs_rank[:3]]

    return result


# cosine similarity
def similarity(v1, v2):
    n1 = np.linalg.norm(v1)
    n2 = np.linalg.norm(v2)
    if n1 == 0 or n2 == 0:
        return 1
    else:
        return np.dot(v1, v2) / (n1 * n2)


# Min-Max 歸一化
def min_max_y(raw_data):
    # 裝進標準化後的新串列
    min_max_data = []
    
    # 進行Min-Max標準化
    for d in raw_data:
        try:
            min_max_data.append((d - min(raw_data)) / (max(raw_data) - min(raw_data)))
        except ZeroDivisionError:
            min_max_data.append(1)
                
    # 回傳結果
    return min_max_data


if __name__ == '__main__':
    print("Start APP...")
    
    app.run(host="0.0.0.0")
    # app.run(debug=True)