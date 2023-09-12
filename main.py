from flask import Flask, render_template, request, jsonify
import txt_to_art
import os

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ['APP_KEY']


@app.route('/')
def hello(name=None):
    return render_template("index.html", name=name)


@app.route('/reader.html')
def serve_reading_view():
    return render_template("reader.html")


@app.route('/ajax', methods=['GET', 'POST'])
def ajax_process_text():
    # book_title = request.form.get("title")
    selected_text = request.form.get("prompt").strip()
    generated_img_url = txt_to_art.dalle2(selected_text)
    print(generated_img_url)
    return jsonify({"url": generated_img_url})


app.debug = True
if __name__ == "__main__":
    app.run()
