from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/simple')
def simple():
    return render_template("simple.html")

@app.route('/usmap')
def usmap():
    return render_template("usmap.html")


if __name__ == "__main__":
    app.run(debug=True) # `debug=True` gives us a fancier flask debugger in the browser
