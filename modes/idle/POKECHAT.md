# PokéChat

NPC conversations are local and saved in `pokefone.chat` with the existing game save. Threads carry a stable ID, kind, members, messages, read timestamp and pin/mute/archive preferences. Messages carry unique ID, sender, timestamp, text, delivery status and an optional quoted reply. UI text is inserted with textContent.

NPC responses are deterministic, not an AI chat service. Quick replies delegate to the existing game services. The Incubator creates one message per ready egg ID. Clearing a conversation requires confirmation. Export creates a local text download.

The Players tab is a placeholder, not a network simulation. Before enabling it, add authenticated accounts and a server-backed transport with thread membership checks, server timestamps, cursor pagination, deduplicated IDs and delivery/read acknowledgements. Server-side moderation, rate limits, friend requests, blocking/reporting and privacy settings are required for private conversations and groups. Never accept client-supplied identity or authoritative Pokémon stats; shared Pokémon cards must resolve through validated server records. Keep remote history separate from NPC save data. Do not display online status or read receipts without server evidence.

Voice/video calls, voice recording, attachments and player messaging are not implemented in this local version.
