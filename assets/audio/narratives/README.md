# Narrative Audio Files

This directory contains audio narrations for literary synonyms' multi-part narratives.

## Audio Generation

Audio files are generated using Microsoft Edge TTS with the following voices:

### departir (Literary Colombian voices)
- **Part 1**: `co_female_1` (es-CO-SalomeNeural - Colombian Spanish, female)
- **Part 2**: `co_male_1` (es-CO-GonzaloNeural - Colombian Spanish, male)
- **Part 3**: `co_female_1` (es-CO-SalomeNeural - Colombian Spanish, female)

## File Structure

```
departir_part_1.mp3  - Salón literario scene (185K, co_female_1)
departir_part_2.mp3  - Tertulia development (144K, co_male_1)
departir_part_3.mp3  - Meta-reflection (182K, co_female_1)
```

## Text Content

Full text for each part is available in `data/audio_metadata.json` under the `narratives` section.

## Voice Selection Rationale

Colombian Spanish voices were chosen for "departir" to match the literary, formal register of the narrative and reflect the cultural sophistication of Latin American intellectual traditions (tertulias, literary salons). The rate is reduced by 5% for elegant, measured delivery befitting the formal register.
