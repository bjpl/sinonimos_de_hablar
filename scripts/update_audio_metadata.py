#!/usr/bin/env python3
"""
Update audio_metadata.json with all example sentences
Reads from synonyms.json and creates complete metadata
"""

import json

# Load synonyms data
with open('data/synonyms.json', 'r', encoding='utf-8') as f:
    synonyms = json.load(f)

# Build complete audio metadata
metadata = {
    "generated_at": "2025-10-26T22:50:00.000Z",
    "voice_provider": "gTTS",
    "voice_models": ["es"],
    "verbs": {},
    "examples": {}
}

# Add all verbs and examples
for synonym in synonyms:
    verb = synonym['verb']
    examples = synonym.get('examples', [])

    # Add verb audio
    metadata['verbs'][verb] = {
        "file": f"assets/audio/verbs/{verb}.mp3",
        "voice": "es",
        "duration_ms": 800
    }

    # Add example audio
    metadata['examples'][verb] = []
    for i, example_text in enumerate(examples, 1):
        metadata['examples'][verb].append({
            "file": f"assets/audio/examples/{verb}_example_{i}.mp3",
            "voice": "es",
            "text": example_text
        })

# Save updated metadata
with open('data/audio_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)

print(f"✅ Updated audio metadata")
print(f"   - {len(metadata['verbs'])} verb audio references")
print(f"   - {sum(len(v) for v in metadata['examples'].values())} example audio references")
print(f"   - Total: {len(metadata['verbs']) + sum(len(v) for v in metadata['examples'].values())} audio files")
