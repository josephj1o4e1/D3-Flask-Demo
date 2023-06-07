from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
from io import StringIO
import codecs

app = Flask(__name__)

# # Reading Data 
# with codecs.open('static/data/ProjectDataUSA-week3.csv', 'r', errors='replace') as file: # errors='replace' parameter tells the codecs module to replace any problematic characters with the Unicode replacement character. 
#     content = file.read()

# # Create a pandas DataFrame from the content
# kickstarter_df = pd.read_csv(StringIO(content))

# def data_creation(data, class_labels, group=None):
#     for index, item in enumerate(percent):
#         data_instance = {}
#         data_instance['category'] = class_labels[index]
#         data_instance['value'] = item
#         data_instance['group'] = group
#         data.append(data_instance)

# def calculate_percentage(val, total):
#     """Calculates the percentage of a value over a total"""
#     percent = np.round((np.divide(val, total) * 100), 2)
#     return percent

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/simple')
def simple():
    return render_template("simple.html")

# @app.route('/get_usmap_Data') 
# def get_usmap_Data(): # countPerState, read pd.data and covert to json
#     _ = kickstarter_df[["Project Page Location State", ]]

#     usmap_data = []
#     data_creation(usmap_data)
#     return jsonify(usmap_data)

@app.route('/usmap')
def usmap(): # casecountPerState
    return render_template("usmap.html") # render_template("usmap.html", data=jsondata)


@app.route('/scatter')
def usmap(): 
    return render_template("scatter.html") # render_template("scatter.html", data=jsondata)


if __name__ == "__main__":
    app.run(debug=True) # `debug=True` gives us a fancier flask debugger in the browser
