import os
import json
import hashlib
import logging
from collections import Counter

from flask import Flask, jsonify, render_template, request, url_for
from spleeter.separator import Separator
import tensorflow as tf
import numpy as np
import librosa

# ===================== Config =====================
THRESHOLD_NEG = 2                 # itne negative feedbacks par flag
MAX_DURATION = 180                # seconds
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "static/outputs"
FEEDBACK_FILE = "learning_data.json"
BAD_OUTPUTS_FILE = "outputs_to_improve.json"

# ===================== Runtime / TensorFlow =====================
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
tf.config.threading.set_intra_op_parallelism_threads(1)

app = Flask(__name__)

# Make sure folders/files exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
if not os.path.exists(FEEDBACK_FILE):
    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

# Single Spleeter model load
separator = Separator('spleeter:2stems', stft_backend='librosa', multiprocess=False)

# ===================== Helpers =====================
def rebuild_flags_from_feedback():
    """
    learning_data.json padho, negative/positive counts nikalo,
    aur outputs_to_improve.json ko auto-update karo.
    Rule: negatives >= THRESHOLD_NEG AND negatives > positives
    """
    try:
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            fb = json.load(f)
    except Exception:
        fb = []

    neg = Counter([x.get("output_id") for x in fb if x.get("rating") == "negative"])
    pos = Counter([x.get("output_id") for x in fb if x.get("rating") == "positive"])

    flagged = []
    for oid, n in neg.items():
        if not oid:
            continue
        if n >= THRESHOLD_NEG and n > pos.get(oid, 0):
            flagged.append(oid)

    try:
        with open(BAD_OUTPUTS_FILE, "w", encoding="utf-8") as f:
            json.dump(sorted(set(flagged)), f, indent=2, ensure_ascii=False)
    except Exception:
        logging.exception("Could not write outputs_to_improve.json")

    return set(flagged)

def is_problematic_output(output_id: str) -> bool:
    """outputs_to_improve.json me hai to True."""
    if os.path.exists(BAD_OUTPUTS_FILE):
        try:
            with open(BAD_OUTPUTS_FILE, 'r', encoding='utf-8') as f:
                bad_outputs = json.load(f)
            return output_id in bad_outputs
        except Exception:
            logging.exception("Failed reading BAD_OUTPUTS_FILE")
            return False
    return False

# Optional: silence favicon 404 quickly
@app.route('/favicon.ico')
def favicon():
    return ('', 204)

# ===================== Routes =====================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file or not file.filename.lower().endswith(('.mp3', '.wav')):
        return jsonify({'error': 'Only MP3/WAV files allowed'}), 400

    input_path = None
    temp_input = None

    try:
        # ---- Read upload once
        file_bytes = file.read()
        if not file_bytes:
            return jsonify({'error': 'Empty file'}), 400
        if len(file_bytes) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large (max 50MB)'}), 400

        # ---- Save temp & build CONTENT HASH (stable even if metadata/filename differ)
        orig_ext = os.path.splitext(file.filename)[1]
        temp_input = os.path.join(UPLOAD_FOLDER, f"temp_upload{orig_ext}")
        with open(temp_input, 'wb') as f:
            f.write(file_bytes)

        y, sr = librosa.load(temp_input, sr=22050, mono=True)
        # quantize to avoid tiny float differences across encodes
        y_q = (y * 32768.0).astype(np.int16)
        file_id = hashlib.md5(y_q.tobytes()).hexdigest()

        # ---- Final paths
        input_path = os.path.join(UPLOAD_FOLDER, f"input_{file_id}{orig_ext}")
        output_dir = os.path.join(OUTPUT_FOLDER, f"output_{file_id}")
        subdir = os.path.join(output_dir, f"input_{file_id}")  # Spleeter writes here
        os.makedirs(output_dir, exist_ok=True)

        # ---- Save final input
        with open(input_path, 'wb') as f:
            f.write(file_bytes)

        # ---- Archive original mix for future auto-enhance
        archive_ext = (orig_ext or ".wav").lower()
        archive_mix_path = os.path.join(output_dir, f"original{archive_ext}")
        with open(archive_mix_path, 'wb') as f:
            f.write(file_bytes)

        # ---- Cached separation: skip if already exists
        voc_path_disk = os.path.join(subdir, "vocals.wav")
        acc_path_disk = os.path.join(subdir, "accompaniment.wav")

        if not (os.path.exists(voc_path_disk) and os.path.exists(acc_path_disk)):
            separator.separate_to_file(
                input_path,
                output_dir,
                duration=MAX_DURATION,
                offset=0
            )

        # ---- Build URLs safely
        vocal_url = url_for('static', filename=f"outputs/output_{file_id}/input_{file_id}/vocals.wav")
        acc_url   = url_for('static', filename=f"outputs/output_{file_id}/input_{file_id}/accompaniment.wav")

        flagged = is_problematic_output(file_id)

        # ---- Save latest id (handy for quick scripts)
        try:
            with open('latest_id.txt', 'w', encoding='utf-8') as _f:
                _f.write(file_id)
        except Exception:
            logging.exception("Could not write latest_id.txt")

        # ---- Debug (remove later if you want)
        print("DEBUG output_id:", file_id)
        print("DEBUG flagged:", flagged)
        print("DEBUG exists:", os.path.exists(voc_path_disk), os.path.exists(acc_path_disk))

        return jsonify({
            'vocal_path': vocal_url,
            'instrumental_path': acc_url,
            'output_id': file_id,
            'flagged': flagged
        })

    except Exception:
        logging.exception("Processing error")
        return jsonify({'error': 'Processing failed. Please try a different file or smaller size.'}), 500

    finally:
        # cleanup temp & input
        try:
            if input_path and os.path.exists(input_path):
                os.remove(input_path)
        except Exception:
            logging.exception("Failed to remove input file")
        try:
            if temp_input and os.path.exists(temp_input):
                os.remove(temp_input)
        except Exception:
            logging.exception("Failed to remove temp file")

@app.route('/feedback', methods=['POST'])
def feedback():
    try:
        data = request.get_json(silent=True) or {}
        rating = data.get('rating')
        comment = data.get('comment', '')
        output_id = data.get('output_id', '')

        if rating not in ('positive', 'negative'):
            return jsonify({'error': 'Invalid rating'}), 400
        if not output_id:
            return jsonify({'error': 'Missing output_id'}), 400

        # append feedback
        feedback_entry = {
            'output_id': output_id,
            'rating': rating,
            'comment': comment
        }

        with open(FEEDBACK_FILE, 'r+', encoding='utf-8') as f:
            try:
                content = json.load(f)
            except json.JSONDecodeError:
                content = []
            content.append(feedback_entry)
            f.seek(0)
            json.dump(content, f, indent=2, ensure_ascii=False)
            f.truncate()

        # auto-rebuild flags right after feedback
        new_flags = rebuild_flags_from_feedback()

        return jsonify({
            'message': 'Feedback received. Thank you!',
            'now_flagged': output_id in new_flags,  # abhi-abhi flag hua ya nahi
            'flag_count': len(new_flags)
        })

    except Exception:
        logging.exception("Feedback error")
        return jsonify({'error': 'Failed to save feedback'}), 500

if __name__ == '__main__':
    # Optional: ensure flags file exists
    if not os.path.exists(BAD_OUTPUTS_FILE):
        with open(BAD_OUTPUTS_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f)
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
