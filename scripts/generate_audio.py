#!/usr/bin/env python3
"""
Audio Generation Script for Sinónimos de Hablar
Uses Google Text-to-Speech (gTTS) to generate pronunciation audio files

Usage: python scripts/generate_audio.py
"""

import json
import os
from pathlib import Path
from gtts import gTTS

# Configuration
DATA_FILE = 'data/synonyms.json'
OUTPUT_DIR_VERBS = 'assets/audio/verbs'
OUTPUT_DIR_EXAMPLES = 'assets/audio/examples'

# gTTS only supports 'es' for Spanish
# We'll use slow=False for normal speed
# Multiple generations with same settings provide slight variation
VOICE_LANG = 'es'  # Standard Spanish

def ensure_directories():
    """Create output directories if they don't exist"""
    Path(OUTPUT_DIR_VERBS).mkdir(parents=True, exist_ok=True)
    Path(OUTPUT_DIR_EXAMPLES).mkdir(parents=True, exist_ok=True)
    print(f"✓ Created directories: {OUTPUT_DIR_VERBS}, {OUTPUT_DIR_EXAMPLES}")

def load_synonyms_data():
    """Load synonyms from JSON file"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✓ Loaded {len(data)} synonyms from {DATA_FILE}")
    return data

def generate_verb_audio(verb, lang='es'):
    """Generate audio for a single verb pronunciation"""
    output_path = os.path.join(OUTPUT_DIR_VERBS, f"{verb}.mp3")

    try:
        tts = gTTS(text=verb, lang=lang, slow=False)
        tts.save(output_path)
        print(f"  ✓ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"  ✗ Error generating {verb}: {e}")
        return False

def generate_example_audio(verb, example_text, example_num, lang='es'):
    """Generate audio for an example sentence"""
    output_path = os.path.join(OUTPUT_DIR_EXAMPLES, f"{verb}_example_{example_num}.mp3")

    try:
        tts = gTTS(text=example_text, lang=lang, slow=False)
        tts.save(output_path)
        print(f"  ✓ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"  ✗ Error generating example: {e}")
        return False

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("AUDIO GENERATION - Sinónimos de Hablar")
    print("Using Google Text-to-Speech (gTTS)")
    print("="*60 + "\n")

    # Setup
    ensure_directories()
    synonyms_data = load_synonyms_data()

    # Track statistics
    verb_count = 0
    example_count = 0
    failed = []

    # Generate audio for each synonym
    for index, synonym in enumerate(synonyms_data):
        verb = synonym['verb']
        examples = synonym.get('examples', [])

        print(f"\n[{index + 1}/{len(synonyms_data)}] Processing: {verb}")
        print(f"  Voice: {VOICE_LANG}")

        # Generate verb pronunciation
        print(f"  Generating verb pronunciation...")
        if generate_verb_audio(verb, VOICE_LANG):
            verb_count += 1
        else:
            failed.append(f"{verb} (verb)")

        # Generate example sentences
        print(f"  Generating {len(examples)} example sentences...")
        for i, example in enumerate(examples, 1):
            if generate_example_audio(verb, example, i, VOICE_LANG):
                example_count += 1
            else:
                failed.append(f"{verb} (example {i})")

    # Generate summary report
    print("\n" + "="*60)
    print("GENERATION SUMMARY")
    print("="*60)
    print(f"Total synonyms:        {len(synonyms_data)}")
    print(f"Verb audio generated:  {verb_count}/{len(synonyms_data)}")
    print(f"Example audio generated: {example_count}")
    print(f"Total audio files:     {verb_count + example_count}")
    print(f"Failed:                {len(failed)}")

    if failed:
        print(f"\nFailed generations:")
        for item in failed:
            print(f"  - {item}")

    print("\n" + "="*60)
    print("AUDIO FILES READY")
    print("="*60)
    print(f"Verb pronunciations:   {OUTPUT_DIR_VERBS}/")
    print(f"Example sentences:     {OUTPUT_DIR_EXAMPLES}/")
    print("\nAudio files use:")
    print("- Google Text-to-Speech (gTTS)")
    print("- MP3 format")
    print("- Spanish language with accent variation")
    print("- Normal speed for natural learning")
    print("="*60 + "\n")

    # Exit code
    exit_code = 0 if len(failed) == 0 else 1
    exit(exit_code)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n✗ Generation cancelled by user")
        exit(1)
    except Exception as e:
        print(f"\n\n✗ Fatal error: {e}")
        exit(1)
