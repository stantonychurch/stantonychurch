from flask import Flask, render_template, send_from_directory, url_for, redirect
import os

app = Flask(__name__, static_folder='assets', static_url_path='/assets')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/download_apk')
def download_apk():
    # Serve the actual compiled APK file directly
    return send_from_directory(os.path.join(app.root_path, 'assets', 'app'), 'st-antony.apk', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
