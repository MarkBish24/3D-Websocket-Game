# Socket Architecture Design

This document outlines the `socket.io` infrastructure for the multi-room game and social system.

## Namespaces & Rooms

To maintain clean separation of concerns, we will use separate namespaces or logical room prefixes.

### 1. General/Social Namespace (`/social`)
**Purpose**: Presence tracking, notifications, and matchmaking.

| Room Name | Participants | Events |
| :--- | :--- | :--- |
| `online-users` | All logged-in users | `user:online`, `user:offline`, `status:update` |
| `user-{userId}` | Single user (private) | `notify:friend-request`, `notify:game-invite`, `notify:chat` |
| `matchmaking` | Users seeking games | `match:search`, `match:found`, `match:cancel` |

### 2. Chat Namespace (`/chat`)
**Purpose**: 1-on-1 and Group messaging.

| Room Name | Participants | Events |
| :--- | :--- | :--- |
| `chat-{chatId}` | Two specific users | `chat:message`, `chat:typing`, `chat:read` |

### 3. Game Namespace (`/game`)
**Purpose**: High-frequency sync for 3D gameplay.

| Room Name | Participants | Events |
| :--- | :--- | :--- |
| `game-{gameId}` | Players in a match | `tick`, `tock`, `game:start`, `game:end` |

## Event Definitions

### Social Events
- `user:online`: Emitted to `online-users` when a socket connects and authentication is verified.
- `notify:friend-request`: Sent to `user-{targetId}` when the backend controller processes a new friend request.
- `notify:game-invite`: Sent to `user-{targetId}` including the `gameId`.

### UI Implementation (Notifications)
- **Position**: Bottom-right corner.
- **Behavior**: Persistent across all tabs/pages.
- **Content**: Icon, Title, Message, and Action buttons (e.g., "Accept", "Join").

## Data Structures

### User Mapping
`Map<UserId, Set<SocketId>>`: Tracks all active sockets for a specific user (handles multiple tabs).

### Peer-to-Peer Chat ID
Generated as: `sort([id1, id2]).join('-')` to ensure uniqueness between two users.
