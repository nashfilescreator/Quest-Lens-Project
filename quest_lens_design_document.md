# QUEST LENS: Frontend UI Design Document

**Version:** 1.0  
**Core Technology Target:** Flutter / Native Mobile  
**Design Philosophy:** Tactical Noir / Neon-Futurism

---

## 1. Executive Summary
QUEST LENS is an immersive, AI-driven scavenger hunt platform. The UI must feel like a "Tactical Operating System" for the real world. It utilizes high-contrast dark themes, glassmorphism (frosted glass effects), and fluid animations to blend digital gameplay with camera-based physical exploration.

---

## 2. Visual Design System

### 2.1 Color Palette
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Background** | `#05080F` | Main app canvas, deep space blue. |
| **Surface** | `#1A1F35` | Card backgrounds, modular sections. |
| **Primary** | `#8B5CF6` | Action buttons, progress bars, Quest accents. |
| **Secondary** | `#06B6D4` | Scanner HUD, Radar blips, technical info. |
| **Accent Gold** | `#FACC15` | Coins, Legendaries, Crown icons. |
| **Success** | `#10B981` | Validation checkmarks, positive XP. |
| **Danger** | `#EF4444` | Health bars, Arena/Competitive UI. |

### 2.2 Typography
*   **Font Family (Display):** `Space Grotesk` (Bold/Black) - Used for Titles, Stats, and HUD elements.
*   **Font Family (Body):** `Inter` (Regular/Medium/Bold) - Used for descriptions, labels, and chat.
*   **Wording Style:** All caps for technical headers, Sentence case for descriptions.

### 2.3 UI Effects
*   **Glassmorphism:** Use `BackdropFilter` with `sigmaX: 10, sigmaY: 10` for top bars and modals.
*   **Neon Glows:** Inner and outer shadows with primary colors (e.g., `BoxShadow` with spread).
*   **Grid Patterns:** Subtle background overlays (1px lines at 10% opacity) to evoke a holographic feel.

---

## 3. Global Navigation Structure

### 3.1 Main Shell (Bottom Navigation)
*   **Layout:** Floating semi-transparent bar anchored to bottom.
*   **Items:** 
    1.  **Quests:** Dashboard and filters.
    2.  **Map:** Tactical Radar view.
    3.  **Scan (Center):** Large glowing primary action button (Adventure Lens).
    4.  **Social:** Feed, Leaderboard, and Teams.
    5.  **Profile:** Stats, Inventory, and Settings.

---

## 4. Screen-by-Screen Breakdown

### 4.1 Onboarding & Authentication
*   **Structure:** Full-screen `Stack`.
*   **Layout:** 
    *   **Background:** High-res abstract photography with dark gradient overlay.
    *   **Foreground:** Bottom-heavy `Column`.
*   **Components:** 
    *   Animated `IconContainer` with pulsing primary glow.
    *   `SmoothPageIndicator` for step tracking.
    *   `FrostedInput` fields for email/password.
    *   `GlowButton` for primary CTA.

### 4.2 Mission Dashboard (Home)
*   **Structure:** `Scaffold` with `CustomScrollView` (Sliver architecture).
*   **Layout:** 
    1.  **SliverAppBar (Flexible):** 220dp height. Dynamic background image based on user's highest role affinity. Displays "Good Morning [User]" and primary XP stats.
    2.  **SliverPersistentHeader (Sticky):** Horizontal scrolling `FilterChips`.
    3.  **SliverList (Body):** Vertical scroll of `QuestCards`.
*   **QuestCard Component:** 
    *   AspectRatio: `16:9` or `4:3`.
    *   Left side: Title, Difficulty badge, XP/Coin rewards.
    *   Right side: Circular progress or "Join" arrow.
    *   Background: Blurred target image with dark gradient.

### 4.3 Adventure Lens (Scanner)
*   **Structure:** Full-screen `CameraPreview`.
*   **Appearance:** HUD overlay.
*   **Layout:**
    *   **Top HUD:** Real-time transcriptions (subtitles) and target description.
    *   **Center:** Target reticle with animated "Scanning Line" (top-to-bottom CSS/Tween animation).
    *   **Bottom:** Zoom slider and large Shutter button.
*   **Interactions:** On capture, the screen freezes with a "Digital Glitch" transition to show analysis progress.

### 4.4 Team Command Center (Unified)
*   **Structure:** `NestedScrollView` with `TabBarView`.
*   **Layout:**
    *   **Header:** Team avatar (holographic style), Rank ticker, and total members.
    *   **Ops Tab:** Large `DirectiveCard` showing active mission, progress bar (neon blue), and "Contribute Intel" button.
    *   **Roster Tab:** Grid of `AgentCards`. Each card shows agent level, online status (pulsing green dot), and role.

### 4.5 Social Hub
*   **Structure:** `TabBar` navigation (Feed | Ranking | Friends).
*   **Layout (Feed):** Vertical list of `PostCards`.
    *   **Appearance:** Square image aspect ratio.
    *   **Components:** User header, Like/Comment/Share buttons, verified badge if quest-related.
*   **Layout (Ranking):** 3-column `Podium` for top players, then a standard `ListView` for the rest.

### 4.6 Oracle (AI Assistant)
*   **Structure:** Conventional chat interface with a "Live Mode" variant.
*   **Appearance:** Messages appear as tech-bubble style.
*   **Components:**
    *   `SourceChips`: Small links to grounding data (URLs).
    *   `VoiceInputOverlay`: A pulsating red waveform when Live mode is active.

---

## 5. Animation Strategy

1.  **Hero Transitions:** Use Flutter's `Hero` widget to transition quest images from Dashboard -> Quest Detail.
2.  **Staggered Entrance:** List items should slide up with a slight delay (0.05s increments).
3.  **Lottie Integration:** Use Lottie for high-fidelity animations like Level Up celebrations or Coin collecting.
4.  **Haptic Feedback:** 
    *   Heavy: Mission Success.
    *   Light: Button Taps.
    *   Pulse: Scanning in progress.

---

## 6. Functional Requirements for Implementation

*   **State Management:** BloC or Riverpod recommended for managing complex stats across multiple tabs.
*   **Persistence:** `shared_preferences` or `sqflite` for local caching of quests and settings.
*   **Camera Integration:** `camera` package with manual focus and zoom controller access.
*   **Networking:** `dio` for API calls to Gemini API (wrapped in a secure backend or using direct keys via environment variables).

---
*End of Document*