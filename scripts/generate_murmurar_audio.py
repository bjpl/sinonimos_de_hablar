#!/usr/bin/env python3
"""Generate audio for murmurar verb"""
import asyncio
import json
import os
import edge_tts

OUTPUT_DIR_VERBS = 'assets/audio/verbs'
OUTPUT_DIR_EXAMPLES = 'assets/audio/examples'

# Use Argentina male voice for murmurar (continuing rotation)
VERB_VOICE = 'es-AR-TomasNeural'  # ar_male_1
VOICE_LABEL = 'ar_male_1'

# Examples use next voices in rotation
EXAMPLE_VOICES = [
    {'code': 'es-US-PalomaNeural', 'label': 'us_female_1'},
    {'code': 'es-US-AlonsoNeural', 'label': 'us_male_1'},
    {'code': 'es-MX-DaliaNeural', 'label': 'mx_female_1'},
]

EXAMPLES = [
    "Los estudiantes murmuraban durante el examen.",
    "Siempre están murmurando sobre los vecinos.",
    "El viento murmuraba entre las hojas de los árboles."
]

async def generate_audio(text, output_path, voice_code):
    """Generate audio file"""
    try:
        communicate = edge_tts.Communicate(text, voice_code)
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

async def main():
    print("\n🎵 Generating audio for murmurar...")

    # Generate verb
    print(f"\n  Verb: murmurar ({VOICE_LABEL})")
    verb_path = os.path.join(OUTPUT_DIR_VERBS, 'murmurar.mp3')
    if await generate_audio('murmurar', verb_path, VERB_VOICE):
        print(f"  ✓ {verb_path}")
    else:
        print(f"  ✗ Failed")

    # Generate examples
    print(f"\n  Examples:")
    for i, (example, voice) in enumerate(zip(EXAMPLES, EXAMPLE_VOICES), 1):
        example_path = os.path.join(OUTPUT_DIR_EXAMPLES, f'murmurar_example_{i}.mp3')
        if await generate_audio(example, example_path, voice['code']):
            print(f"  ✓ Example {i} ({voice['label']})")
        else:
            print(f"  ✗ Example {i} failed")

    print("\n✅ Murmurar audio complete!\n")

if __name__ == '__main__':
    asyncio.run(main())
