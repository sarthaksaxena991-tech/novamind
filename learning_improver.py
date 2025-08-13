import json
from collections import Counter

FEEDBACK_FILE = "learning_data.json"
IMPROVEMENT_LOG = "improvement_log.txt"

def analyze_feedback():
    try:
        with open(FEEDBACK_FILE, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading feedback file: {e}")
        return

    if not data:
        print("No feedback data found.")
        return

    positive = [f for f in data if f['rating'] == 'positive']
    negative = [f for f in data if f['rating'] == 'negative']

    print(f"Total feedback entries: {len(data)}")
    print(f"👍 Positive: {len(positive)}")
    print(f"👎 Negative: {len(negative)}")

    # Analyze comments
    neg_comments = [f['comment'] for f in negative if f.get('comment')]
    comment_counter = Counter(" ".join(neg_comments).split())

    # Log insights
    with open(IMPROVEMENT_LOG, 'w') as log:
        log.write("=== FEEDBACK ANALYSIS ===\n")
        log.write(f"Total: {len(data)} | Positive: {len(positive)} | Negative: {len(negative)}\n\n")
        log.write("⚠️ Common Negative Words:\n")
        for word, count in comment_counter.most_common(10):
            log.write(f"{word}: {count}\n")

    print("Improvement log saved to:", IMPROVEMENT_LOG)

if __name__ == "__main__":
    analyze_feedback()
