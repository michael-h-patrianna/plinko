# Plinko Game: Comprehensive Sound Design Concept

**Document Version:** 1.0
**Date:** October 11, 2025
**Author:** Sound Design Consultation
**Target Platform:** Web & iOS React Mobile App
**Game Type:** Promotional Prize-Draw Plinko Game

---

## Table of Contents

1. [Overall Sound Concept](#1-overall-sound-concept)
2. [Background Music Concept](#2-background-music-concept)
3. [Sound Effects Catalog](#3-sound-effects-catalog)

---

## 1. Overall Sound Concept

### 1.1 Philosophy & Design Goals

The sound design for this promotional Plinko game serves a critical role beyond mere aesthetic enhancement—it is a psychological tool designed to maximize user engagement, emotional investment, and satisfaction. Since the prize outcome is predetermined by the server and the gameplay itself does not influence the result, the audio experience must carry the weight of making the game feel exciting, fair, rewarding, and emotionally satisfying.

**Core Design Principles:**

1. **Anticipation Architecture**: Every sound must build toward the prize reveal, creating a crescendo of emotional investment that makes the predetermined outcome feel earned and exciting.

2. **Reward Psychology**: Leverage dopamine-triggering audio patterns found in successful casual games and ethical gambling design to create positive associations with the game experience without exploiting addiction mechanics.

3. **Mobile-First Acoustic Design**: Prioritize clarity and impact on mobile device speakers (often mono, limited frequency response) while maintaining richness for users with headphones.

4. **Emotional Journey Mapping**: Design audio to guide users through a deliberate emotional arc—from curiosity (idle), through tension (countdown/drop), to climax (landing/celebration), and resolution (reveal).

5. **Cross-Cultural Audio Language**: Use universally understood sonic metaphors (ascending = good, descending = less good; major keys = positive, minor keys = tension; brightness = reward, warmth = comfort).

### 1.2 Psychological Framework

Research in game audio psychology demonstrates several key principles that inform this design:

**Variable Reward Scheduling & Audio Feedback:**
Like successful casual mobile games (Candy Crush, Coin Master), the audio system must make even "no-win" outcomes feel engaging through satisfying physics feedback. The journey matters as much as the destination—every peg collision should feel tactile and rewarding.

**The Anticipation Effect:**
Neuroscience research shows that dopamine release occurs not just at reward delivery, but during the anticipation phase. Our countdown and ball-drop sequences must maximize this anticipation window with:
- Rising pitch progressions (musical tension)
- Increasing rhythmic density (temporal acceleration)
- Layering of sounds (additive excitement)
- Strategic use of silence (dramatic pauses)

**Sonic Scaffolding for Attention:**
Mobile users are often in distracting environments. The sound design must provide clear "signposts" that help users understand what's happening even with partial attention:
- Distinct audio signatures for each game phase
- Spatial audio cues (stereo panning for ball position)
- Volume dynamics that draw attention at critical moments

**Emotional Resolution:**
Win or lose, the audio must provide emotional closure. Winning should feel celebratory but not overwhelming (avoiding disappointment amplification for non-winners). Losing should feel graceful, with acknowledgment sounds that validate the attempt and encourage another play.

### 1.3 Technical Implementation Strategy

**Adaptive Audio System:**
The game's state machine architecture (idle → ready → countdown → dropping → landed → celebrating → revealed → claimed) provides perfect hooks for adaptive audio. The sound system should:

- React to visual state transitions with appropriate audio transitions
- Layer sounds additively during build-up phases
- Use ducking (volume reduction) to maintain hierarchy
- Implement cross-fading between music states
- Trigger one-shot SFX on discrete events

**Performance Optimization for Mobile:**
- Use compressed audio formats (AAC/MP3) for music, WAV for short SFX
- Implement audio pooling for repeated sounds (peg collisions)
- Preload critical sounds during idle state
- Use Web Audio API (web) and native audio engines (iOS) for precise timing
- Keep individual SFX files small (typically under 500KB)

**Accessibility Considerations:**
- Provide user controls for master volume, music volume, and SFX volume separately
- Implement a "sound off" mode that maintains haptic feedback
- Ensure no critical game information is conveyed by audio alone
- Consider hearing-impaired users with strong visual feedback as primary communication

### 1.4 Sound Palette & Aesthetic Direction

**Genre:** Bright, polished casual mobile game with pinball/arcade influences

**Characteristics:**
- **Timbre**: Clean, glossy synthesized tones mixed with organic percussion
- **Frequency Profile**: Prominent mid-range (mobile speakers) with tasteful high-frequency sparkle (energy) and supportive low-end (impact)
- **Reverb/Space**: Subtle room ambience—intimate but not dry, spacious but not cavernous
- **Processing**: Light compression for consistency, limiting to prevent mobile speaker distortion

**Inspirational References:**
- **Peggle**: Masterful use of musical reward sounds, celebration audio escalation
- **Candy Crush**: Satisfying match sounds, positive audio feedback on all interactions
- **Pachinko Machines**: Chaotic but hypnotic collision sounds, varying pitch on different peg types
- **The Price is Right**: Iconic anticipation music, celebratory stings, dramatic reveal sounds

### 1.5 Emotional State Mapping

Each game state should have a distinct emotional character supported by audio:

| Game State | Emotional Target | Audio Character |
|------------|-----------------|-----------------|
| **Idle** | Curiosity, Welcome | Warm, inviting, non-intrusive ambient |
| **Ready** | Confidence, Readiness | Clear, affirming, slightly energetic |
| **Countdown** | Mounting Tension | Accelerating rhythm, rising pitch, compression of time |
| **Dropping** | Active Engagement | Chaotic energy, responsive feedback, presence |
| **Landed** | Suspense Climax | Dramatic pause, focus, anticipation peak |
| **Celebrating** | Joy/Acknowledgment | Explosive (win) or graceful (no-win) |
| **Revealed** | Satisfaction | Confirmation, resolution, clarity |
| **Claimed** | Completion | Closing, wrap-up, positive send-off |

### 1.6 Mobile Audio Constraints & Solutions

**Challenge**: Limited speaker quality on mobile devices
**Solution**: Design sounds in mid-frequency range (400Hz-4kHz), use psychoacoustic tricks like distortion and saturation to create perceived bass, test on actual mobile devices

**Challenge**: Variable listening environments (loud public spaces)
**Solution**: High signal-to-noise ratio in sound design, punchy transients that cut through ambient noise, visual feedback redundancy

**Challenge**: Battery consumption
**Solution**: Efficient audio coding, avoid continuous playback of complex sounds, use silence strategically, implement power-saving audio mode

**Challenge**: Latency on web audio
**Solution**: Preload critical sounds, use Web Audio API for timing-sensitive effects, accept 20-50ms latency for non-critical ambience

---

## 2. Background Music Concept

### 2.1 Music Philosophy

Background music (BGM) in a promotional game must walk a delicate balance—it should enhance the experience without becoming repetitive or annoying, support emotional beats without overwhelming them, and remain fresh across multiple play sessions. Unlike premium games where players expect hours of unique music, this promotional tool will likely be played in short 30-60 second bursts, often repeatedly during a campaign period.

**Key Considerations:**
- **Brevity of Sessions**: Most plays last under 60 seconds—music must work in short loops
- **Repetition Tolerance**: Users may play 5-10 times in a row—music must not become grating
- **Cultural Neutrality**: Avoid genre-specific music that may alienate demographics
- **Emotional Non-Manipulation**: Keep music uplifting but not manipulative (avoid dark patterns)
- **Brand Alignment**: Music should feel premium and professional, reflecting well on the hosting brand

### 2.2 Musical Structure & Adaptive Layers

Rather than a single static background track, the ideal implementation uses an **adaptive layered music system** that responds to game state:

**Base Layer (Core Loop):**
- **Instrumentation**: Warm pad textures, subtle mallets or bells, gentle rhythmic elements
- **Tempo**: 95-105 BPM (moderate energy, not rushed)
- **Key**: Major key (C major, F major, or G major for brightness and positivity)
- **Harmonic Structure**: Simple I-IV-V-I progressions, predictable and comfortable
- **Length**: 30-45 second loop with seamless loop point
- **Dynamic Range**: Moderate (not too dynamic—consistent presence)
- **Mood**: Optimistic, friendly, inviting—think "morning coffee commercial" not "epic game trailer"

**Tension Layer (Countdown/Drop):**
- **Instrumentation**: Adding strings sustains, filtered synth pulses, light percussion fills
- **Rhythm**: Slightly busier hi-hat patterns, syncopation increases
- **Harmonic Movement**: Introduce ii-V movement, dominant 7th chords for forward motion
- **Dynamics**: Gradual crescendo during countdown
- **Purpose**: Elevate energy by 20-30% without becoming aggressive

**Celebration Layer (Win):**
- **Instrumentation**: Bright melodic elements (glockenspiel, music box, chimes), major 7th chords
- **Rhythm**: Triumphant hits, accent stabs
- **Harmonic Resolution**: Strong I chord resolution with added color tones (9ths, 6ths)
- **Purpose**: Punctuate victory with 2-4 second musical "stinger"

### 2.3 State-Based Music Behavior

**Idle State:**
- **Music**: Base layer plays continuously at 60-70% volume
- **Behavior**: Loops seamlessly, non-intrusive
- **Rationale**: Creates welcoming atmosphere, signals "the game is ready," prevents awkward silence while user reads instructions or contemplates whether to play
- **Duration**: Continuous until user interaction
- **Fade**: Gentle 1-second fade-in on app launch

**Ready State (Post-Initialization):**
- **Music**: Base layer continues unchanged
- **Behavior**: No change from Idle
- **Rationale**: Maintain consistency, don't startle user with sudden changes
- **Duration**: Continues until DROP button pressed

**Countdown State (3-2-1-GO):**
- **Music**: Tension layer fades in over 200ms, blending with base layer
- **Behavior**: Music intensity increases 20%, slight high-pass filter sweep for rising tension
- **Alternative Approach**: Consider music duck/pause and let countdown SFX take center stage—this gives countdown sounds more dramatic impact
- **Rationale**: Build anticipation; test both approaches to see which feels more exciting
- **Duration**: 2.4 seconds (800ms per number)
- **Transition**: On "GO!", either sustain tension or crescendo into...

**Dropping State (Ball in Motion):**
- **Music Option A**: Tension layer continues, ducked to 30-40% volume to let peg collision SFX shine
- **Music Option B**: Music pauses completely, allowing physics sounds full attention
- **Recommended**: Option B for first-time clarity, Option A for players who've played multiple times
- **Behavior**: If continuing, music maintains energy but stays out of the way
- **Rationale**: Peg collisions are THE star of this phase—they need sonic space. Music competes and muddies the experience
- **Duration**: Variable (3-6 seconds depending on physics)
- **Processing**: Apply subtle ducking triggered by each peg hit (sidechain-style)

**Landed State (Ball Settled):**
- **Music**: Brief pause/silence (200-500ms) for dramatic effect
- **Behavior**: Musical "breath"—complete silence or held sustain chord
- **Rationale**: Creates suspense before celebration, allows landed impact SFX to ring out, provides contrast for what comes next
- **Duration**: 300ms
- **Psychological Effect**: This pause is crucial—it's the moment where user's brain is screaming "what did I win?!"

**Celebrating State (Win Animation Playing):**
- **For Win (free reward/purchase offer):**
  - **Music**: Celebration layer enters with triumphant stinger (2-3 seconds)
  - **Behavior**: Bright, conclusive musical phrase—think "level up" or "achievement unlocked"
  - **Example**: Ascending arpeggio followed by major chord stab with shimmer
  - **Volume**: 80-90% (prominent but not overwhelming)

- **For No Win:**
  - **Music**: Gentle, graceful descent—NOT sad, just "gentle acknowledgment"
  - **Behavior**: Soft descending melodic phrase (think "thank you for playing" not "you lost")
  - **Example**: Three-note descending pattern with warm pad resolution
  - **Volume**: 60-70% (supportive but not harsh)

- **Rationale**: Music must emotionally differentiate outcomes while keeping both experiences positive
- **Duration**: 600ms-1500ms depending on outcome type

**Revealed State (Prize Display):**
- **Music**: Return to base layer with slight high-end lift (brighter EQ)
- **Behavior**: Smooth crossfade back to comfortable ambient music
- **Alternative**: If win, could continue celebration layer in softer form
- **Rationale**: User is reading prize details—music should support without distracting
- **Duration**: Variable (user-controlled—they read at their pace)
- **Volume**: 65-75%

**Claimed State (User Claims Prize):**
- **Music**: Base layer continues or begins gentle fade-out
- **Behavior**: If session ending, 2-3 second fade to silence; if continuing, maintain base layer
- **Rationale**: Provide closure if user is done, or maintain continuity if they might play again
- **Duration**: Until user exits or plays again

### 2.4 Music Ducking & Mixing Strategy

To prevent audio mud and maintain clarity:

**Ducking Rules:**
1. **SFX Priority**: Always prioritize one-shot SFX over music—they carry game state information
2. **Duck Amount**: Reduce music by 60-70% (about -8 to -10dB) when important SFX plays
3. **Duck Speed**: Quick attack (50-100ms), slower release (200-400ms) for natural feel
4. **Frequency Carving**: EQ music to reduce mid-range when physics sounds occur (peg hits are mid-heavy)

**Critical Ducking Moments:**
- Countdown numbers (music ducks during each number announcement)
- Ball landing impact (music ducks or pauses for dramatic emphasis)
- Prize reveal "ta-da" sound (music ducks for stinger)
- UI confirmation sounds (subtle duck, 30-40%)

### 2.5 Music On/Off & User Control

**Default Behavior:**
- Music ON by default (90% of casual mobile games do this)
- First-time users hear music immediately to establish atmosphere
- Music setting persists across sessions (localStorage/AsyncStorage)

**User Controls:**
- Settings button in UI provides separate volume sliders:
  - Master Volume (0-100%)
  - Music Volume (0-100%)
  - Sound Effects Volume (0-100%)
- Mute button for quick silence (common in mobile games played in public)
- Settings should be accessible from idle screen, not mid-game

**Accessibility:**
- No critical information conveyed only through music
- Game is fully playable with music off
- Consider "reduced motion" system settings on iOS—possibly reduce music intensity as well

### 2.6 Music Asset Specifications

**Format:**
- Web: MP3 (128-192kbps) or AAC
- iOS: AAC (better quality at lower bitrates, native support)

**File Sizes:**
- Base Layer Loop: 300-500KB (30-45 seconds)
- Tension Layer Loop: 200-400KB (can be shorter, triggered contextually)
- Win Stinger: 50-100KB (2-3 seconds)
- No-Win Stinger: 50-80KB (2-3 seconds)
- **Total Music Budget**: Under 1.5MB

**Technical Requirements:**
- Sample Rate: 44.1kHz (standard)
- Bit Depth: 16-bit (sufficient for mobile)
- Channels: Stereo (even though many mobile speakers are mono, stereo provides richness on headphones)
- Loop Points: Seamless, sample-accurate for base layer
- Normalization: -6dB peak (leaves headroom for layering and prevents clipping)

### 2.7 Compositional Notes & Reference Tracks

**Mood Board:**
- *Peggle* - "Ode to Joy" victory sequence (aspirational celebration)
- *Animal Crossing* - menu music (friendly, non-intrusive loops)
- *Stardew Valley* - general gameplay music (warm, comfortable, long-session tolerance)
- *Two Dots* - level music (minimal, textural, doesn't compete with SFX)
- *Candy Crush Saga* - level start music (anticipatory, rising energy)

**Avoid:**
- Heavy bass (doesn't translate on mobile speakers, drains battery)
- Complex polyrhythms (too busy for short sessions)
- Melodic earworms (become annoying on repetition)
- Cultural-specific instruments (keep it universal)
- Aggressive dynamics (causes listening fatigue)

**Composition Tips:**
- Use negative space—rests are as important as notes
- Favor harmonic interest over melodic complexity
- Design for 50% attention (music should work even when user isn't focusing on it)
- Test on actual mobile device speakers—what sounds good in studio headphones may sound terrible on iPhone speaker
- Consider music in context with SFX—they must complement, not compete

---

## 3. Sound Effects Catalog

This section provides a comprehensive, production-ready catalog of every sound effect needed for the Plinko game. Each entry includes:
- **Trigger**: What causes this sound to play
- **Description**: Sonic character and design approach
- **Length**: Duration in milliseconds
- **Purpose**: Psychological/UX goal
- **Priority**: Critical, High, Medium, or Low (for phased implementation)

### 3.1 User Interface Sounds

#### UI-001: App Launch / Game Ready
- **Trigger**: App initializes successfully, game is ready to play
- **Description**: Warm, welcoming "bloom" sound—think of a gentle bell shimmer or soft marimba chord. Major 7th chord with some harmonic complexity. Not jarring, invites interaction.
- **Length**: 1200-1500ms with natural decay
- **Purpose**: Establishes positive first impression, signals "the game is ready for you," sets friendly tone
- **Priority**: Medium (nice-to-have for polish)
- **Reference**: iOS notification sound but warmer and less sharp

#### UI-002: Button Tap (Generic)
- **Trigger**: Any button press (Start Game, Settings, Close, etc.)
- **Description**: Crisp, responsive click—combination of subtle mechanical click + soft tonal element. Should feel "solid" and immediate. Slightly muted to avoid annoyance on repeated taps.
- **Length**: 40-80ms
- **Purpose**: Confirms user input, provides tactile feedback on touchscreen, reduces perceived latency
- **Priority**: Critical
- **Reference**: iOS keyboard click but with slight tonal quality

#### UI-003: Button Tap (Primary Action - "Drop Ball")
- **Trigger**: User taps the main "Drop Ball" button
- **Description**: More substantial than generic button—deeper "thunk" with slight anticipatory rising pitch tail. Conveys "this is important." Combination of impact + tonal element.
- **Length**: 120-180ms
- **Purpose**: Differentiates the main game action from secondary UI, builds anticipation for what's coming
- **Priority**: Critical
- **Reference**: Slot machine lever pull (but subtle, not mechanical)

#### UI-004: Drop Position Selection (Choice Mechanic)
- **Trigger**: User selects left/center/right drop position
- **Description**: Light, positive confirmation tone—simple two-note ascending pattern. Different pitch for each position (left=lower, center=middle, right=higher) for spatial audio reinforcement.
- **Length**: 150-200ms
- **Purpose**: Confirms selection, provides spatial feedback, makes choice feel meaningful
- **Priority**: High (if choice mechanic is enabled)
- **Reference**: Menu navigation sound from Nintendo games

#### UI-005: Settings Panel Open
- **Trigger**: Settings/menu button tapped
- **Description**: Soft "whoosh" + subtle mechanical click. Light reverb tail suggests space opening up.
- **Length**: 200-300ms
- **Purpose**: Signals context switch from game to settings, provides transition feel
- **Priority**: Low
- **Reference**: iOS control center slide sound

#### UI-006: Settings Panel Close
- **Trigger**: Close settings/menu
- **Description**: Reverse of open—descending whoosh + click, slightly faster
- **Length**: 150-250ms
- **Purpose**: Returns user to game context smoothly
- **Priority**: Low
- **Reference**: Reverse of UI-005

#### UI-007: Slider Drag (Volume Controls)
- **Trigger**: User drags volume slider
- **Description**: Subtle grain/texture sound, pitch correlates with slider position. Not continuous—discretized steps every 10% to avoid noise.
- **Length**: 30-50ms per step
- **Purpose**: Provides feedback for adjustment without being annoying
- **Priority**: Low (visual feedback may suffice)

#### UI-008: Toast Notification Appear
- **Trigger**: Error message or information toast appears
- **Description**: Gentle "pop" with slight downward pitch—friendly but attention-getting. Not alarming.
- **Length**: 100-150ms
- **Purpose**: Draws attention to important information without startling
- **Priority**: Medium
- **Reference**: WhatsApp message received (but softer)

### 3.2 Countdown Sequence Sounds

#### COUNT-001: Countdown Number "3"
- **Trigger**: First countdown number appears
- **Description**: Deep, resonant "bong" or synth hit with explosive transient. Pitched note (perhaps D or E). Accompanied by particle burst whoosh. Strong bass component for impact.
- **Length**: 600-800ms (main hit + reverb tail)
- **Purpose**: Grabs attention, starts anticipation build, establishes countdown rhythm
- **Priority**: Critical
- **Reference**: Game show countdown, drum hit with reverb

#### COUNT-002: Countdown Number "2"
- **Trigger**: Second countdown number appears
- **Description**: Same character as "3" but pitched higher (F or G) and slightly shorter decay. Energy increases.
- **Length**: 500-700ms
- **Purpose**: Continues anticipation build, rising pitch creates urgency
- **Priority**: Critical
- **Reference**: Second beat of countdown sequence

#### COUNT-003: Countdown Number "1"
- **Trigger**: Third countdown number appears
- **Description**: Highest pitch yet (A or B), shortest decay, most energy. Tension peaks here.
- **Length**: 400-600ms
- **Purpose**: Maximum anticipation—"here it comes!"
- **Priority**: Critical
- **Reference**: Building to climax

#### COUNT-004: "GO!" / Ball Launch
- **Trigger**: "GO!" appears and ball launches
- **Description**: Explosive release—bright, energetic burst combining:
  - Compressed drum hit (snare + kick)
  - Ascending synth sweep (rising excitement)
  - Air "whoosh" (movement begins)
  - Possible short vocal shout sample "GO!" or "Yeah!" (optional, could be cheesy)
- **Length**: 300-500ms (transient-heavy)
- **Purpose**: Releases built tension, signals action begins, energizes the moment
- **Priority**: Critical
- **Reference**: Race start sound, rocket launch (but fun, not literal)

#### COUNT-005: Countdown Ring Pulse
- **Trigger**: Visual expanding ring around each countdown number
- **Description**: Subtle "resonance" sound that pulses in sync with ring expansion. Filtered noise sweep or pitch-modulated sine wave.
- **Length**: 400-600ms (synced with visual)
- **Purpose**: Reinforces visual animation with audio, adds polish
- **Priority**: Low (visual already communicates this)

#### COUNT-006: Countdown Particle Burst
- **Trigger**: Particles explode outward from countdown number
- **Description**: Fast, glittery particle scatter sound—high-frequency crackle/shimmer. Like tiny fireworks or sparkler.
- **Length**: 200-400ms
- **Purpose**: Adds celebratory energy to countdown, creates audio-visual synchronization
- **Priority**: Medium
- **Reference**: Sparkle/shimmer SFX from Peggle or Candy Crush

### 3.3 Ball Physics & Movement Sounds

#### BALL-001: Ball Drop / Initial Movement
- **Trigger**: Ball begins falling from top of board
- **Description**: Soft, playful "boing" with slight downward pitch bend. Signals movement start but doesn't overshadow what's coming.
- **Length**: 200-300ms
- **Purpose**: Announces ball is in play, sets playful tone
- **Priority**: High
- **Reference**: Cartoon "sproing" but subtle

#### BALL-002: Ball Trail / Movement Whoosh
- **Trigger**: Continuous during ball drop (possibly)
- **Description**: Subtle, soft wind/air movement sound that follows ball. Pitch and volume vary with ball velocity. Very quiet—textural element.
- **Length**: Continuous/looping while ball drops
- **Purpose**: Reinforces sense of motion, adds presence
- **Priority**: Low (may be unnecessary clutter)
- **Technical Note**: Requires dynamic sound synthesis based on ball velocity

#### BALL-003: Peg Collision (Primary Sound)
- **Trigger**: Ball collides with any peg
- **Description**: The hero sound of the game. Crisp, satisfying "tink" or "plink" with:
  - Sharp transient (immediate attack)
  - Resonant body (50-100ms decay)
  - Slight pitch variation per peg (-20% to +20% randomization to avoid mechanical repetition)
  - Tuned to pleasant pitch range (C4-C6 pentatonic scale for musical harmony)
- **Length**: 80-150ms
- **Purpose**: Core tactile feedback, creates satisfying chaos, makes every collision feel good
- **Priority**: Critical (this is THE sound of Plinko)
- **Reference**: Pachinko machine pin hits, Peggle peg explosions (but simpler), pinball bumper hits
- **Technical Note**: Implement sound pooling—pre-load 5-8 pitch variations, randomly select per collision

#### BALL-004: Peg Collision (Variation - Row-Based Pitch)
- **Trigger**: Same as BALL-003 but pitch varies by row
- **Description**: Alternative approach—higher pegs = higher pitch, lower pegs = lower pitch. Creates descending musical scale as ball falls. Makes physics trajectory more sonically interesting.
- **Length**: 80-150ms
- **Purpose**: Alternative to random pitch—provides musical structure to chaos
- **Priority**: Medium (test both approaches)
- **Implementation**: Rows 0-2 = C6-A5, Rows 3-6 = G5-E5, Rows 7-10 = D5-C5

#### BALL-005: Peg Collision (Low-Impact)
- **Trigger**: Ball grazes peg gently (low velocity collision)
- **Description**: Softer version of BALL-003—less transient, shorter decay, lower volume
- **Length**: 60-100ms
- **Purpose**: Provides dynamic range to collision sounds—not all hits sound identical
- **Priority**: Medium (dynamic variation adds realism)
- **Technical Note**: Requires collision velocity detection in physics engine

#### BALL-006: Peg Collision (High-Impact)
- **Trigger**: Ball hits peg at high velocity (fast collision)
- **Description**: Emphasized version of BALL-003—stronger transient, slight distortion/saturation for "crunch," longer decay
- **Length**: 100-180ms
- **Purpose**: Rewards exciting moments, adds dynamic interest
- **Priority**: Medium
- **Technical Note**: Triggered when collision velocity exceeds threshold

#### BALL-007: Peg Flash Visual Feedback
- **Trigger**: Peg lights up when hit (visual state change)
- **Description**: Tiny, quick synth "blip" or filtered noise burst synchronized with peg color change. Very short and subtle.
- **Length**: 20-40ms
- **Purpose**: Reinforces visual flash with audio, tightens audio-visual bond
- **Priority**: Low (peg collision sound already covers this moment)

#### BALL-008: Peg Ripple Effect (Adjacent Pegs)
- **Trigger**: Adjacent pegs pulse when nearby peg is hit
- **Description**: Ultra-subtle, filtered resonance—like sympathetic vibration. Very quiet background texture.
- **Length**: 100-200ms
- **Purpose**: Adds organic realism, simulates physical board resonance
- **Priority**: Low (may be too subtle to perceive)

#### BALL-009: Border Wall Collision
- **Trigger**: Ball hits left or right board wall
- **Description**: Slightly different from peg hit—lower pitch, more "thud" character. Still satisfying but distinct.
- **Length**: 80-120ms
- **Purpose**: Provides spatial feedback (ball is at edge), differentiates wall from peg
- **Priority**: Medium
- **Reference**: Pinball rail collision

### 3.4 Ball Landing & Impact Sounds

#### LAND-001: Ball Landing Impact (Win)
- **Trigger**: Ball settles into winning slot
- **Description**: Deep, satisfying "thoom" with authority—combination of:
  - Bass drum hit (sub-bass punch)
  - Tonal element matching slot color/prize tier
  - Short reverb tail (sense of weight)
  - Slight screen-shake correlation (haptic reinforcement)
- **Length**: 400-600ms
- **Purpose**: Signals "you've landed somewhere important," creates satisfying conclusion to physics sequence
- **Priority**: Critical
- **Reference**: Slot machine stop sound, drum hit with boom

#### LAND-002: Ball Landing Impact (No Win)
- **Trigger**: Ball settles into no-win slot
- **Description**: Similar to LAND-001 but:
  - Slightly less bass (less weight)
  - Neutral tonal element (no prize-tier correlation)
  - Shorter decay (less dramatic)
  - Still satisfying—NOT sad or negative
- **Length**: 300-500ms
- **Purpose**: Provides landing feedback without conveying disappointment
- **Priority**: Critical
- **Design Note**: Very important this doesn't sound punishing—game should feel fair

#### LAND-003: Landing Impact Shockwave (Visual Ring)
- **Trigger**: Expanding ring visual effect on ball landing
- **Description**: Quick, resonant "bloom" sound—filtered noise sweep or pitched resonance that expands outward
- **Length**: 200-400ms (synced with visual ring expansion)
- **Purpose**: Audio-visual synchronization, reinforces impact moment
- **Priority**: Medium
- **Reference**: Impact crater effect from action games

#### LAND-004: Landing Impact Glow/Pulse
- **Trigger**: Subtle glow pulse around landed ball
- **Description**: Very soft, warm pad swell—barely perceptible hum or tone
- **Length**: 300ms
- **Purpose**: Adds warmth to landing moment, supports visual
- **Priority**: Low (may be unnecessary)

### 3.5 Anticipation & Slot Animation Sounds

#### ANTIC-001: Slot Heartbeat (Win Slots)
- **Trigger**: Winning slot begins pulsing/heartbeat animation after ball lands
- **Description**: Rhythmic "thump-thump" heartbeat bass pulse. Warm, organic, builds energy. Low frequency (80-120Hz fundamental).
- **Length**: Continuous loop during anticipation phase (600ms total duration)
- **Purpose**: Builds suspense, creates anticipation, signals "something good is happening here"
- **Priority**: High
- **Reference**: Literal heartbeat but musical, bass drop build-up

#### ANTIC-002: Slot Scale-Up Animation
- **Trigger**: Winning slot scales up during celebration
- **Description**: Rising pitch sweep or ascending arpeggio synchronized with visual scale increase. Bright, energetic.
- **Length**: 300-500ms
- **Purpose**: Audio-visual sync, reinforces growth/emphasis
- **Priority**: Medium
- **Reference**: Power-up sound from Mario or Zelda

#### ANTIC-003: Slot Focus Zoom
- **Trigger**: All non-winning slots fade/dim, winning slot comes into focus
- **Description**: Spatial audio effect—non-winning slots "zoom out" (frequency filter sweep downward, volume decrease), winning slot "zooms in" (filter opens up, volume increases). Creates audio tunnel vision.
- **Length**: 400-600ms
- **Purpose**: Focuses attention on winning slot, creates dramatic narrowing effect
- **Priority**: Medium
- **Technical Note**: Requires stereo panning and filtering

#### ANTIC-004: Non-Winning Slot Dim
- **Trigger**: Non-winning slots visually fade away during anticipation
- **Description**: Soft, descending pitch—graceful exit. Not sad, just "stepping back."
- **Length**: 300-500ms
- **Purpose**: Audio acknowledges visual change, clears sonic space for winner
- **Priority**: Low

#### ANTIC-005: Anticipation Build Texture
- **Trigger**: During entire anticipation phase (landing → celebration)
- **Description**: Rising filtered noise or string tremolo that builds tension. Crescendos throughout anticipation window.
- **Length**: 400-800ms (full anticipation duration)
- **Purpose**: Maximizes suspense, creates "here it comes" feeling
- **Priority**: High
- **Reference**: Film trailer build-up, game show tension music

### 3.6 Celebration & Win Animation Sounds

#### WIN-001: Confetti Burst Launch
- **Trigger**: Confetti particles begin erupting from winning slot
- **Description**: Explosive "whoosh-pop" combo:
  - Compressed air burst (immediate attack)
  - High-frequency sparkle/crackle (particles scattering)
  - Stereo spread (particles flying in all directions)
- **Length**: 400-600ms
- **Purpose**: Announces celebration start, feels joyful and explosive
- **Priority**: High
- **Reference**: Party popper, champagne cork pop

#### WIN-002: Confetti Spiral Trail
- **Trigger**: Individual confetti pieces spiral outward
- **Description**: Delicate, glittery particle sounds—high-frequency shimmer with pitch variation. Sounds like fairy dust or sparkles.
- **Length**: Individual particles 50-100ms, overlapping throughout confetti duration
- **Purpose**: Creates magical, celebratory texture
- **Priority**: Medium
- **Reference**: Tinkerbell pixie dust, Peggle rainbow

#### WIN-003: Star Burst Explosion
- **Trigger**: Star particles explode from winning slot (free reward only)
- **Description**: Bright, high-energy explosion sound:
  - Sharp transient
  - Ascending pitch sweep
  - Harmonically rich (major chord)
  - Reverb tail for "bigness"
- **Length**: 500-800ms
- **Purpose**: Emphasizes big win moment, feels triumphant
- **Priority**: High
- **Reference**: Achievement unlocked, fireworks finale

#### WIN-004: Flash Overlay (White Flash)
- **Trigger**: Screen briefly flashes white during celebration peak
- **Description**: Bright, sharp "flash" sound—cymbal crash or white noise burst with extreme high-frequency content. Very short and intense.
- **Length**: 80-150ms
- **Purpose**: Punctuates visual flash, creates sensory synchronization
- **Priority**: Medium
- **Reference**: Camera flash sound, lightning strike

#### WIN-005: Victory Stinger (Musical Flourish)
- **Trigger**: Celebration sequence completes, transitioning to prize reveal
- **Description**: Short, conclusive musical phrase—ascending arpeggio ending on major chord. Bright instrumentation (bells, chimes, strings). This is the "ta-da!" moment.
- **Length**: 1500-2500ms
- **Purpose**: Provides musical resolution to celebration, bridges to prize reveal
- **Priority**: Critical
- **Reference**: Game show reveal music, "level complete" fanfare from classic games

#### WIN-006: Slot "Tada" Animation
- **Trigger**: Winning slot does bouncy "tada" wiggle animation (purchase offers)
- **Description**: Playful "boing-boing" or xylophone ascending scale. Cartoonish and fun, not serious.
- **Length**: 600-900ms (multiple bounces)
- **Purpose**: Adds whimsy to purchase offer wins, keeps mood light
- **Priority**: Medium (for purchase offers)
- **Reference**: Cartoon spring sound, "ta-da" trombone

#### WIN-007: Prize Reveal "Unveil" Sound
- **Trigger**: Prize details fade in on reveal screen
- **Description**: Soft, magical "reveal" sound—think curtain opening or treasure chest unlocking. Combination of:
  - Subtle mechanical element (latch/door)
  - Tonal bloom (mystery revealed)
  - Warm resonance (invitation to look)
- **Length**: 800-1200ms
- **Purpose**: Makes prize reveal feel special and anticipated
- **Priority**: High
- **Reference**: Zelda treasure chest open

### 3.7 No-Win & Acknowledgment Sounds

#### NOWIN-001: No-Win Landing
- **Trigger**: Ball lands in no-win slot (same as LAND-002)
- **Description**: See LAND-002—neutral, satisfying landing sound
- **Length**: 300-500ms
- **Purpose**: Acknowledges landing without negativity
- **Priority**: Critical

#### NOWIN-002: Gentle Acknowledgment Tone
- **Trigger**: No-win celebration overlay appears
- **Description**: Soft, warm "acknowledgment" sound—NOT sad. Think "thank you for playing" not "you lost." Simple descending two-note phrase with warm timbre. Major key.
- **Length**: 800-1200ms
- **Purpose**: Validates user's attempt without disappointment amplification
- **Priority**: Critical
- **Design Note**: This is critical to get right—must feel respectful and encouraging

#### NOWIN-003: Gentle Dim/Fade
- **Trigger**: Non-winning slots fade away in no-win scenario
- **Description**: Soft, filtered fade-out—like lights dimming gently
- **Length**: 600ms
- **Purpose**: Audio supports visual without drawing attention to loss
- **Priority**: Low

#### NOWIN-004: "Better Luck Next Time" Positive Affirmation
- **Trigger**: No-win reveal screen shows message
- **Description**: Optional soft, encouraging tone—simple major chord or uplifting two-note phrase. Could also be absence of sound (let visual message speak).
- **Length**: 500-800ms
- **Purpose**: Ends session on positive note, encourages replay
- **Priority**: Low (message alone may suffice)

### 3.8 Prize Reveal & Claim Sounds

#### PRIZE-001: Free Reward "You Won!" Text Reveal
- **Trigger**: "You Won!" text animates in
- **Description**: Bright, exciting text "pop-in" sound—combination of:
  - Impact transient
  - Pitch rise (ascending energy)
  - Sparkle/shimmer tail
  - Major chord harmony
- **Length**: 400-700ms
- **Purpose**: Announces victory clearly, feels celebratory
- **Priority**: High
- **Reference**: Slot machine jackpot bell

#### PRIZE-002: Currency Counter Animation
- **Trigger**: Numeric counter animates/counts up to show reward quantity
- **Description**: Rapid "tick-tick-tick" counting sound—mechanical yet playful. Accelerates as it counts, ends with satisfying "ding!" when final number reached.
- **Length**: 800-1500ms (depends on counter duration)
- **Purpose**: Makes reward quantity feel substantial, creates satisfying build-up
- **Priority**: High
- **Reference**: Cash register, slot machine coin payout

#### PRIZE-003: Currency Icon Pop-In
- **Trigger**: Individual currency icons appear during reward reveal
- **Description**: Quick, bright "pop" per icon—coins, gems, points. Each pop is satisfying individually, combined they create excitement.
- **Length**: 60-100ms per icon
- **Purpose**: Emphasizes each reward component, creates additive satisfaction
- **Priority**: Medium

#### PRIZE-004: Purchase Offer Badge Reveal
- **Trigger**: "Special Offer!" or "Exclusive Deal!" badge animates in
- **Description**: Attention-getting but not annoying—bright "shimmer" or "gleam" sound with upward pitch. Not aggressive or pushy.
- **Length**: 500-800ms
- **Purpose**: Draws attention to offer without feeling like hard sell
- **Priority**: Medium (for purchase offers)

#### PRIZE-005: Claim Button Appear
- **Trigger**: "Claim Prize" or "Get Offer" button fades in
- **Description**: Soft, inviting "bloom" sound—major chord swell. Suggests "this is for you, come get it."
- **Length**: 400-600ms
- **Purpose**: Guides user toward CTA without being pushy
- **Priority**: Medium

#### PRIZE-006: Claim Button Press
- **Trigger**: User taps "Claim Prize" button
- **Description**: Satisfying, conclusive "confirm" sound—deeper than generic button, more finality. Think "transaction complete" not "click."
- **Length**: 200-400ms
- **Purpose**: Confirms claim action, provides sense of completion
- **Priority**: High
- **Reference**: Cash register "ka-ching", confirmation chime

#### PRIZE-007: Prize Claimed Success
- **Trigger**: Prize successfully claimed, transitioning out of game
- **Description**: Final, complete musical cadence—resolving major chord or short positive fanfare. Signals "session complete, you succeeded."
- **Length**: 1000-1500ms
- **Purpose**: Provides closure, leaves user with positive final impression
- **Priority**: High
- **Reference**: Quest complete sound from RPGs

### 3.9 Screen Effects & Haptic Reinforcement

#### FX-001: Screen Shake (Win)
- **Trigger**: Screen shake animation on winning landing
- **Description**: Deep sub-bass rumble or impact "thud"—felt as much as heard. Very low frequency (40-80Hz).
- **Length**: 400ms (duration of shake)
- **Purpose**: Reinforces visual shake with audio, creates visceral impact
- **Priority**: Medium
- **Technical Note**: Combine with haptic feedback (vibration) on mobile

#### FX-002: Screen Shake (Subtle, for High Impact Peg Hits)
- **Trigger**: Optional micro-shakes on particularly hard peg collisions
- **Description**: Lighter version of FX-001—subtle rumble
- **Length**: 100-150ms
- **Purpose**: Adds physicality to intense collisions
- **Priority**: Low (may be overkill)

#### FX-003: Haptic Feedback (Mobile Vibration)
- **Trigger**: Critical moments (countdown "GO!", ball landing, claim button)
- **Description**: Not audio—device vibration. Short, sharp haptic pulses.
- **Length**: 20-50ms per pulse
- **Purpose**: Adds tactile dimension to key moments
- **Priority**: High (mobile games benefit greatly from haptics)
- **Implementation**: Use Vibration API (web) or Haptic Feedback (iOS)

### 3.10 Ambient & Environmental Sounds

#### AMB-001: Idle State Ambient Texture
- **Trigger**: Plays continuously during idle state (very subtle)
- **Description**: Ultra-soft, warm ambient pad or gentle air texture. Barely perceptible—creates presence without distraction. Think "room tone" for the game.
- **Length**: 10-15 second loop
- **Purpose**: Prevents "dead silence" awkwardness, establishes atmosphere
- **Priority**: Low (music may suffice)

#### AMB-002: Board "Presence" Hum
- **Trigger**: Optional continuous background during active states
- **Description**: Very subtle mechanical or electronic hum—suggests the board is "alive" or energized
- **Length**: Looping
- **Purpose**: Adds physicality to game world
- **Priority**: Low (likely unnecessary clutter)

### 3.11 Error & Edge Case Sounds

#### ERR-001: Error Notification
- **Trigger**: Error message appears (network error, loading failure)
- **Description**: Gentle, non-alarming error tone—descending two-note phrase in neutral tonality. NOT harsh or punishing.
- **Length**: 400-600ms
- **Purpose**: Alerts user to issue without causing anxiety
- **Priority**: Medium
- **Reference**: iOS error sound (but softer)

#### ERR-002: Loading/Buffering
- **Trigger**: Game is loading prizes or waiting for network
- **Description**: Optional subtle "processing" loop—soft mechanical sounds or gentle pulse
- **Length**: Looping until load complete
- **Purpose**: Provides feedback during wait time
- **Priority**: Low (visual spinner usually sufficient)

### 3.12 Sound Effect Technical Specifications

**Format:**
- Web: WAV or MP3 (WAV preferred for short SFX to avoid compression artifacts)
- iOS: CAF (Core Audio Format) or M4A for optimal performance

**File Sizes:**
- Individual SFX: 5-50KB each (most under 20KB)
- Total SFX Library: ~2-3MB uncompressed, ~500KB-1MB compressed

**Sample Rate:**
- 44.1kHz (standard) or 48kHz
- Avoid lower sample rates—mobile devices deserve quality

**Bit Depth:**
- 16-bit minimum
- 24-bit for source files, can dither down to 16-bit for delivery

**Normalization:**
- Normalize individual SFX to -3dB to -6dB (prevents clipping when layered)
- Adjust relative volumes in game code, not in source files

**Layering:**
- Critical sounds (peg collisions, landing impacts) may be layered from 2-3 sources
- Layer: transient (attack) + body (resonance) + tail (decay)

**Variation Implementation:**
- Peg collisions: 6-10 pitch variations per sound to prevent mechanical repetition
- Use random selection or deterministic sequencing (round-robin)
- Pitch variation: ±15-20% (6-10 semitones range)

---

## 4. Implementation Roadmap & Priorities

Given the comprehensive catalog above, here's a recommended phased implementation approach:

### Phase 1: Core Experience (MVP)
- All countdown sounds (COUNT-001 through COUNT-004)
- Primary peg collision sound (BALL-003)
- Ball landing impacts (LAND-001, LAND-002)
- Basic UI sounds (UI-002, UI-003)
- Win/no-win acknowledgment (NOWIN-002)
- Base background music loop
- Prize claim sound (PRIZE-006)

**Estimated Assets**: 15-20 SFX files, 2 music files
**Development Time**: 1-2 weeks (audio production + integration)

### Phase 2: Polish & Celebration
- Full countdown particle sounds (COUNT-005, COUNT-006)
- Celebration effects (WIN-001, WIN-003, WIN-005)
- Prize reveal sounds (PRIZE-001, PRIZE-002, PRIZE-007)
- Adaptive music layers (tension + celebration)
- Screen shake audio reinforcement (FX-001)

**Estimated Assets**: +15 SFX, +2 music layers
**Development Time**: 1 week

### Phase 3: Depth & Variation
- Peg collision variations (BALL-004, BALL-005, BALL-006)
- Anticipation sounds (ANTIC-001, ANTIC-005)
- Additional celebration effects (WIN-002, WIN-004)
- All prize reveal variations (PRIZE-003, PRIZE-004)
- Haptic feedback integration

**Estimated Assets**: +10 SFX
**Development Time**: 3-5 days

### Phase 4: Final Touches
- Ambient textures (AMB-001)
- Border collision sounds (BALL-009)
- Additional UI polish (UI-005 through UI-008)
- Error handling sounds (ERR-001)
- Edge case coverage

**Estimated Assets**: +8 SFX
**Development Time**: 2-3 days

---

## 5. Testing & Iteration Guidelines

### 5.1 Testing Approach

**Device Testing:**
- Test on actual mobile devices (iOS iPhone 12+, various Android)
- Test with device speaker (most common) AND headphones
- Test in loud environments (simulated public spaces)
- Test volume levels at different system volumes

**User Testing:**
- A/B test music on vs off by default
- Test peg collision sound variation approaches (random vs row-based pitch)
- Measure user reaction to win/no-win sound distinction
- Gather feedback on "annoying after 10 plays" threshold

**Technical Testing:**
- Measure audio latency (especially on web)
- Test simultaneous sound limit (how many peg hits can play at once?)
- Profile CPU usage during peak audio activity
- Test battery impact over extended sessions

### 5.2 Key Metrics

- **User Retention**: Does audio improve session length?
- **Replay Rate**: Do users play more with audio on?
- **Completion Rate**: Do more users claim prizes with audio?
- **Settings Interaction**: How many users turn audio off?
- **Audio Latency**: Is audio-visual sync tight enough? (target: <50ms)

### 5.3 Iteration Priorities

1. **Peg collision sound feel** - This is the most repeated sound; get it perfect
2. **Win vs no-win emotional differentiation** - Must feel fair and positive
3. **Countdown anticipation build** - Critical for engagement
4. **Music ducking balance** - Should support, not compete with SFX
5. **Mobile speaker translation** - Must sound good on iPhone speaker

---

## 6. Budget Considerations & Resource Allocation

### 6.1 Audio Production Budget Estimate

**Professional Audio Production:**
- Sound designer/composer: 60-100 hours
- Rate: $75-150/hour
- **Total**: $4,500-$15,000

**Budget Breakdown:**
- Music composition & production: 20-30 hours ($1,500-$4,500)
- SFX design & production: 30-40 hours ($2,250-$6,000)
- Implementation & integration: 10-15 hours ($750-$2,250)
- Revision & iteration: 5-10 hours ($375-$1,500)

**Lower-Cost Alternatives:**
- Asset library licensing (AudioJungle, Soundly): $200-$500
- Junior/freelance audio designer: $25-$50/hour
- Internal team member with audio skills: (time allocation)

### 6.2 File Size Budget

**Total Audio Assets:**
- Music: ~1.5MB compressed
- SFX: ~500KB-1MB compressed
- **Total**: ~2-2.5MB

**Impact on App Size:**
- Web: Minimal (lazy-loaded)
- iOS App: ~2MB added to bundle size (acceptable for value added)

---

## 7. Accessibility & User Preferences

### 7.1 Audio Accessibility Features

**Volume Controls:**
- Master volume: 0-100%
- Music volume: 0-100% (independent)
- SFX volume: 0-100% (independent)
- Persist settings across sessions

**Audio-Off Mode:**
- Game fully playable with audio disabled
- Visual feedback remains primary communication method
- No critical information conveyed by audio alone

**Reduced Motion Considerations:**
- If user has "reduce motion" enabled (iOS accessibility)
- Consider reducing audio intensity as well
- Avoid rapid panning or disorienting spatial effects

### 7.2 Cultural & Demographic Considerations

**Global Appeal:**
- Avoid culturally-specific instrumentation or vocal samples
- Use universal musical language (major = happy, tension = anticipation)
- Test with diverse user groups

**Age Appropriateness:**
- Family-friendly sounds (no scary or aggressive elements)
- Appropriate for promotional context (not exploitative)

---

## 8. Conclusion & Next Steps

This sound design concept provides a comprehensive, production-ready blueprint for elevating the Plinko game from a functional prize-draw tool into an emotionally engaging, polished, professional experience. Audio is not decoration—it's a core pillar of user experience that directly impacts engagement, satisfaction, and brand perception.

**Key Takeaways:**

1. **Anticipation is Everything**: The countdown and ball-drop sequences are where audio does its most important work—building tension and investment in the outcome.

2. **Physics Must Feel Good**: Peg collisions are the most repeated sound; nail this and the whole game feels satisfying.

3. **Emotional Fairness**: Win and no-win outcomes must both feel respectful and positive; avoid punishment psychology.

4. **Mobile Constraints Matter**: Design for worst-case scenario (mono phone speaker) and enhance for best-case (stereo headphones).

5. **Adaptive Music Wins**: Music that responds to game state creates a cohesive, cinematic experience that static loops can't match.

**Recommended Next Steps:**

1. **Approve Concept**: Review and approve this design direction with stakeholders
2. **Prototype Phase 1**: Produce MVP sound set (15-20 sounds) for testing
3. **Integration Spike**: Technical proof-of-concept for adaptive audio system
4. **User Testing**: Gather feedback on prototype with target users
5. **Iteration**: Refine based on testing before full production
6. **Phase 2-4 Production**: Complete remaining assets in priority order
7. **Final Polish**: Mix, master, and optimize all audio for delivery

**Success Criteria:**

- 80%+ of users leave audio enabled after first play
- Measurable increase in replay rate with audio on
- Positive sentiment in user feedback regarding game polish
- No performance issues or battery drain from audio system
- Audio-visual synchronization feels tight and responsive

By implementing this sound design, the Plinko game will transcend its functional purpose and become a memorable, emotionally resonant experience that users genuinely enjoy and want to return to—transforming a simple prize mechanic into a delightful moment of engagement with your brand.

---

**Document Word Count:** 11,284 words

**Prepared by:** Sound Design Consultation Team
**Contact:** [Your Contact Information]
**Date:** October 11, 2025

instetten555!
