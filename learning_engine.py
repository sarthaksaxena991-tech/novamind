import json
from collections import Counter

# Step 1: Load feedback data
with open('learning_data.json', 'r') as f:
    data = json.load(f)

# Step 2: Filter only negative feedback
bad_feedback = [entry for entry in data if entry['rating'] == 'negative']

# Step 3: Count how many times each output_id was marked bad
problematic_outputs = Counter(entry['output_id'] for entry in bad_feedback)

# Step 4: Flag output_ids with 2 or more negative feedbacks
threshold = 2
to_improve = [oid for oid, count in problematic_outputs.items() if count >= threshold]

# Step 5: Save these flagged output_ids to a new file
with open('outputs_to_improve.json', 'w') as f:
    json.dump(to_improve, f, indent=2)

# Step 6: Print for visual confirmation
print("🚨 Outputs flagged for improvement:")
if to_improve:
    for oid in to_improve:
        print(f"- {oid}")
else:
    print("No outputs need urgent improvement yet.")
