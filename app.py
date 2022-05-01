from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/", methods=["GET", "POST"])
def api():
    if request.method == "GET":
        return "API OK!"
    else:
        stem = request.values["stem"]
        
        return stem


if __name__ == '__main__':
    app.run(debug=True)