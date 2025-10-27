#!/usr/bin/env python3
"""
Multi-Voice Audio Generation for Sinónimos de Hablar
Uses Microsoft Edge TTS for voice diversity across Latin America

Voices used:
- es-MX (Mexico): DaliaNeural (female), JorgeNeural (male)
- es-CO (Colombia): SalomeNeural (female), GonzaloNeural (male)
- es-AR (Argentina): ElenaNeural (female), TomasNeural (male)
- es-US (US Spanish): PalomaNeural (female), AlonsoNeural (male)
"""

import json
import asyncio
import os
from pathlib import Path
import edge_tts

# Configuration
DATA_FILE = 'data/synonyms.json'
OUTPUT_DIR_VERBS = 'assets/audio/verbs'
OUTPUT_DIR_EXAMPLES = 'assets/audio/examples'

# Voice pool with diversity across Latin America
VOICE_POOL = [
    {'code': 'es-MX-DaliaNeural', 'label': 'mx_female_1', 'region': 'Mexico', 'gender': 'F'},
    {'code': 'es-MX-JorgeNeural', 'label': 'mx_male_1', 'region': 'Mexico', 'gender': 'M'},
    {'code': 'es-CO-SalomeNeural', 'label': 'co_female_1', 'region': 'Colombia', 'gender': 'F'},
    {'code': 'es-CO-GonzaloNeural', 'label': 'co_male_1', 'region': 'Colombia', 'gender': 'M'},
    {'code': 'es-AR-ElenaNeural', 'label': 'ar_female_1', 'region': 'Argentina', 'gender': 'F'},
    {'code': 'es-AR-TomasNeural', 'label': 'ar_male_1', 'region': 'Argentina', 'gender': 'M'},
    {'code': 'es-US-PalomaNeural', 'label': 'us_female_1', 'region': 'US', 'gender': 'F'},
    {'code': 'es-US-AlonsoNeural', 'label': 'us_male_1', 'region': 'US', 'gender': 'M'},
]

def ensure_directories():
    """Create output directories"""
    Path(OUTPUT_DIR_VERBS).mkdir(parents=True, exist_ok=True)
    Path(OUTPUT_DIR_EXAMPLES).mkdir(parents=True, exist_ok=True)
    print(f"✓ Directories ready: {OUTPUT_DIR_VERBS}, {OUTPUT_DIR_EXAMPLES}")

def load_synonyms_data():
    """Load synonyms from JSON"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✓ Loaded {len(data)} synonyms")
    return data

async def generate_audio_file(text, output_path, voice_code):
    """Generate single audio file with specified voice"""
    try:
        communicate = edge_tts.Communicate(text, voice_code)
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

async def main():
    """Main execution"""
    print("\n" + "="*60)
    print("MULTI-VOICE AUDIO GENERATION - Sinónimos de Hablar")
    print("Using Microsoft Edge TTS (8 diverse voices)")
    print("="*60 + "\n")

    # Setup
    ensure_directories()
    synonyms_data = load_synonyms_data()

    # Statistics
    stats = {
        'verbs_success': 0,
        'examples_success': 0,
        'failed': []
    }

    # Voice assignment tracking
    voice_assignments = {
        'verbs': {},
        'examples': {}
    }

    # Generate audio for each synonym
    for index, synonym in enumerate(synonyms_data):
        verb = synonym['verb']
        examples = synonym.get('examples', [])

        # Assign voice for verb (rotate through pool)
        verb_voice = VOICE_POOL[index % len(VOICE_POOL)]

        print(f"\n[{index + 1}/{len(synonyms_data)}] {verb}")
        print(f"  Verb voice: {verb_voice['label']} ({verb_voice['region']} {verb_voice['gender']})")

        # Generate verb pronunciation
        verb_output = os.path.join(OUTPUT_DIR_VERBS, f"{verb}.mp3")
        print(f"  Generating verb...")
        if await generate_audio_file(verb, verb_output, verb_voice['code']):
            print(f"  ✓ {verb}.mp3")
            stats['verbs_success'] += 1
            voice_assignments['verbs'][verb] = {
                'file': f"assets/audio/verbs/{verb}.mp3",
                'voice': verb_voice['label'],
                'region': verb_voice['region']
            }
        else:
            stats['failed'].append(f"{verb} (verb)")

        # Generate examples with voice variety
        print(f"  Generating {len(examples)} examples...")
        voice_assignments['examples'][verb] = []

        for i, example_text in enumerate(examples):
            # Use different voice for each example
            example_voice = VOICE_POOL[(index + i + 1) % len(VOICE_POOL)]
            example_output = os.path.join(OUTPUT_DIR_EXAMPLES, f"{verb}_example_{i+1}.mp3")

            if await generate_audio_file(example_text, example_output, example_voice['code']):
                print(f"  ✓ Example {i+1} ({example_voice['label']})")
                stats['examples_success'] += 1
                voice_assignments['examples'][verb].append({
                    'file': f"assets/audio/examples/{verb}_example_{i+1}.mp3",
                    'voice': example_voice['label'],
                    'text': example_text,
                    'region': example_voice['region']
                })
            else:
                stats['failed'].append(f"{verb} (example {i+1})")

    # Summary
    print("\n" + "="*60)
    print("GENERATION SUMMARY")
    print("="*60)
    print(f"Verbs:    {stats['verbs_success']}/{len(synonyms_data)}")
    print(f"Examples: {stats['examples_success']}")
    print(f"Total:    {stats['verbs_success'] + stats['examples_success']}/56")
    print(f"Failed:   {len(stats['failed'])}")

    if stats['failed']:
        print(f"\nFailed:")
        for item in stats['failed']:
            print(f"  - {item}")

    # Update metadata
    metadata = {
        "generated_at": "2025-10-26T23:00:00.000Z",
        "voice_provider": "Microsoft Edge TTS",
        "voice_models": [v['label'] for v in VOICE_POOL],
        "voices_used": {
            "Mexico": ["mx_female_1", "mx_male_1"],
            "Colombia": ["co_female_1", "co_male_1"],
            "Argentina": ["ar_female_1", "ar_male_1"],
            "US": ["us_female_1", "us_male_1"]
        },
        "verbs": voice_assignments['verbs'],
        "examples": voice_assignments['examples']
    }

    with open('data/audio_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Updated audio_metadata.json")
    print("\n" + "="*60)
    print("VOICE DIVERSITY")
    print("="*60)
    print("8 Different Voices:")
    for voice in VOICE_POOL:
        print(f"  • {voice['label']:15} - {voice['region']} ({voice['gender']})")
    print("="*60 + "\n")

if __name__ == '__main__':
    asyncio.run(main())
