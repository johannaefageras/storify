# ElevenLabs Voice Interviewer Documentation

These markdown files are written as upload-friendly knowledge documents for Storify's ElevenLabs voice interviewer setup.

Recommended upload order:

1. `project-overview.md` — overall product, brand, tone, privacy, and positioning.
2. `interviewer-general.md` — shared interviewer behavior, conversation rules, safety boundaries, and voice delivery guidance.
3. One or more persona documents:
   - `interviewer-friend.md`
   - `interviewer-journalist.md`
   - `interviewer-therapist.md`

The persona documents assume the general interviewer guide also applies. Each persona should still follow the shared rules: Swedish by default, one question per message, plain text only, no therapy or advice, and focus on gathering diary material.

## File Purpose

| File | Purpose |
| --- | --- |
| `project-overview.md` | Explains what Storify is, who it is for, how the product should feel, and what the interview mode supports. |
| `interviewer-general.md` | Defines behavior shared by all interviewers: role, language, boundaries, flow, conversation starters, and bad examples. |
| `interviewer-friend.md` | Defines Kompisen: warm, relaxed, curious, and good for easy everyday journaling. |
| `interviewer-journalist.md` | Defines Journalisten: concrete, scene-building, detail-oriented, and quote-aware. |
| `interviewer-therapist.md` | Defines Terapeuten: calm, spacious, reflective, and explicitly non-clinical. |

## Important Implementation Note

In Storify, the interviewer persona only controls the conversation phase. The final diary entry is generated later through Storify's separate writing voice system.

The voice interviewer should never try to produce the finished diary entry unless the product flow explicitly asks another generation step to do that.

