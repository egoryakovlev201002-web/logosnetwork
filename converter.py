from pathlib import Path
import json
import re

file_path = Path(__file__).with_name("chrysmatthew1.txt")

text = file_path.read_text(encoding="utf-8")

paragraphs = [
    re.sub(r'^[\d\s]+', '', line).replace('"', "")
    for line in text.splitlines()
    if line.strip()
]

file_path.write_text(
    json.dumps(paragraphs, ensure_ascii=False, indent=4),
    encoding="utf-8"
)

print(paragraphs)