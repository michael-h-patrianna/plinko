/**
 * Theme Metadata Schema
 * Provides metadata for every theme property to enable dynamic form generation in the theme editor UI
 *
 * Total metadata entries: 279 (cleaned up from 325+)
 *
 * REMOVED (nonsensical/fixed values - 46 entries):
 * - All spacing.* entries (34 removed) - spacing is a fixed scale, not editable
 * - borderRadius.none (1 removed) - always "0", not editable
 * - Numeric zIndex entries: 0, 10, 20, 30, 40, 50, auto (7 removed) - fixed constants
 * - Unused fontSize: 7xl, 8xl, 9xl (3 removed) - never used in codebase
 * - Unused gradients.buttonOutline (1 removed) - no references found
 *
 * KEPT (actually editable and used):
 * - All colors, gradients (used), typography (used sizes only)
 * - Animation durations and easing functions
 * - Border radius (semantic values: sm, md, lg, xl, 2xl, 3xl, full, component-specific)
 * - Effects (glows, borders, transitions)
 * - All button variants and component styles
 * - Breakpoints and semantic zIndex values (modal, dropdown, tooltip, etc.)
 */

export type PropertyType = 'color' | 'number' | 'string' | 'boolean' | 'gradient' | 'select' | 'object';

export interface ThemePropertyMetadata {
  displayTitle: string;          // Human-readable label (e.g., "Primary Background Color")
  description: string;            // Tooltip text explaining what this does
  type: PropertyType;             // Input type for the UI
  category: string;               // Grouping category (e.g., "Colors", "Typography")
  path: string;                   // Dot notation path (e.g., "colors.background.primary")
  options?: readonly string[];    // For select type: available options
  min?: number;                   // For number type: minimum value
  max?: number;                   // For number type: maximum value
  unit?: string;                  // For number type: unit label (e.g., "px", "ms")
}

/**
 * Complete theme property metadata
 * Organized by category for easy UI grouping
 */
export const themeMetadata: Record<string, ThemePropertyMetadata> = {
  // ===========================
  // BASIC INFO
  // ===========================
  'name': {
    displayTitle: 'Theme Name',
    description: 'The display name for this theme',
    type: 'string',
    category: 'Basic Info',
    path: 'name'
  },
  'isDark': {
    displayTitle: 'Dark Mode',
    description: 'Whether this is a dark theme (helps with automatic contrast adjustments)',
    type: 'boolean',
    category: 'Basic Info',
    path: 'isDark'
  },

  // ===========================
  // COLORS - BACKGROUND
  // ===========================
  'colors.background.primary': {
    displayTitle: 'Primary Background',
    description: 'Main background color for the application',
    type: 'color',
    category: 'Colors - Background',
    path: 'colors.background.primary'
  },
  'colors.background.secondary': {
    displayTitle: 'Secondary Background',
    description: 'Secondary background color for panels and sections',
    type: 'color',
    category: 'Colors - Background',
    path: 'colors.background.secondary'
  },
  'colors.background.tertiary': {
    displayTitle: 'Tertiary Background',
    description: 'Tertiary background color for subtle elements',
    type: 'color',
    category: 'Colors - Background',
    path: 'colors.background.tertiary'
  },
  'colors.background.overlay': {
    displayTitle: 'Background Overlay',
    description: 'Semi-transparent overlay color for modals and dialogs',
    type: 'color',
    category: 'Colors - Background',
    path: 'colors.background.overlay'
  },
  'colors.background.overlayDark': {
    displayTitle: 'Dark Background Overlay',
    description: 'Darker semi-transparent overlay color',
    type: 'color',
    category: 'Colors - Background',
    path: 'colors.background.overlayDark'
  },

  // ===========================
  // COLORS - SURFACE
  // ===========================
  'colors.surface.primary': {
    displayTitle: 'Primary Surface',
    description: 'Primary surface color for cards and containers',
    type: 'color',
    category: 'Colors - Surface',
    path: 'colors.surface.primary'
  },
  'colors.surface.secondary': {
    displayTitle: 'Secondary Surface',
    description: 'Secondary surface color for nested containers',
    type: 'color',
    category: 'Colors - Surface',
    path: 'colors.surface.secondary'
  },
  'colors.surface.elevated': {
    displayTitle: 'Elevated Surface',
    description: 'Surface color for elevated elements (modals, dropdowns)',
    type: 'color',
    category: 'Colors - Surface',
    path: 'colors.surface.elevated'
  },

  // ===========================
  // COLORS - PRIMARY
  // ===========================
  'colors.primary.main': {
    displayTitle: 'Primary Color',
    description: 'Main brand color used throughout the application',
    type: 'color',
    category: 'Colors - Primary',
    path: 'colors.primary.main'
  },
  'colors.primary.light': {
    displayTitle: 'Primary Light',
    description: 'Lighter variant of the primary color',
    type: 'color',
    category: 'Colors - Primary',
    path: 'colors.primary.light'
  },
  'colors.primary.dark': {
    displayTitle: 'Primary Dark',
    description: 'Darker variant of the primary color',
    type: 'color',
    category: 'Colors - Primary',
    path: 'colors.primary.dark'
  },
  'colors.primary.contrast': {
    displayTitle: 'Primary Contrast',
    description: 'Contrasting text color for primary backgrounds',
    type: 'color',
    category: 'Colors - Primary',
    path: 'colors.primary.contrast'
  },

  // ===========================
  // COLORS - ACCENT
  // ===========================
  'colors.accent.main': {
    displayTitle: 'Accent Color',
    description: 'Accent color for highlights and interactive elements',
    type: 'color',
    category: 'Colors - Accent',
    path: 'colors.accent.main'
  },
  'colors.accent.light': {
    displayTitle: 'Accent Light',
    description: 'Lighter variant of the accent color',
    type: 'color',
    category: 'Colors - Accent',
    path: 'colors.accent.light'
  },
  'colors.accent.dark': {
    displayTitle: 'Accent Dark',
    description: 'Darker variant of the accent color',
    type: 'color',
    category: 'Colors - Accent',
    path: 'colors.accent.dark'
  },
  'colors.accent.contrast': {
    displayTitle: 'Accent Contrast',
    description: 'Contrasting text color for accent backgrounds',
    type: 'color',
    category: 'Colors - Accent',
    path: 'colors.accent.contrast'
  },

  // ===========================
  // COLORS - TEXT
  // ===========================
  'colors.text.primary': {
    displayTitle: 'Primary Text',
    description: 'Main text color for body content',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.primary'
  },
  'colors.text.secondary': {
    displayTitle: 'Secondary Text',
    description: 'Secondary text color for less important content',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.secondary'
  },
  'colors.text.tertiary': {
    displayTitle: 'Tertiary Text',
    description: 'Tertiary text color for subtle content',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.tertiary'
  },
  'colors.text.disabled': {
    displayTitle: 'Disabled Text',
    description: 'Text color for disabled elements',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.disabled'
  },
  'colors.text.inverse': {
    displayTitle: 'Inverse Text',
    description: 'Text color for dark backgrounds (if light theme)',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.inverse'
  },
  'colors.text.link': {
    displayTitle: 'Link Text',
    description: 'Color for hyperlinks',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.link'
  },
  'colors.text.linkHover': {
    displayTitle: 'Link Hover',
    description: 'Color for hyperlinks on hover',
    type: 'color',
    category: 'Colors - Text',
    path: 'colors.text.linkHover'
  },

  // ===========================
  // COLORS - STATUS
  // ===========================
  'colors.status.success': {
    displayTitle: 'Success Color',
    description: 'Color for success messages and indicators',
    type: 'color',
    category: 'Colors - Status',
    path: 'colors.status.success'
  },
  'colors.status.warning': {
    displayTitle: 'Warning Color',
    description: 'Color for warning messages and indicators',
    type: 'color',
    category: 'Colors - Status',
    path: 'colors.status.warning'
  },
  'colors.status.error': {
    displayTitle: 'Error Color',
    description: 'Color for error messages and indicators',
    type: 'color',
    category: 'Colors - Status',
    path: 'colors.status.error'
  },
  'colors.status.info': {
    displayTitle: 'Info Color',
    description: 'Color for informational messages and indicators',
    type: 'color',
    category: 'Colors - Status',
    path: 'colors.status.info'
  },

  // ===========================
  // COLORS - PRIZES
  // ===========================
  'colors.prizes.orange.main': {
    displayTitle: 'Orange Prize',
    description: 'Main color for orange prize slots',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.orange.main'
  },
  'colors.prizes.orange.light': {
    displayTitle: 'Orange Prize Light',
    description: 'Light variant of orange prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.orange.light'
  },
  'colors.prizes.orange.dark': {
    displayTitle: 'Orange Prize Dark',
    description: 'Dark variant of orange prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.orange.dark'
  },
  'colors.prizes.yellow.main': {
    displayTitle: 'Yellow Prize',
    description: 'Main color for yellow prize slots',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.yellow.main'
  },
  'colors.prizes.yellow.light': {
    displayTitle: 'Yellow Prize Light',
    description: 'Light variant of yellow prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.yellow.light'
  },
  'colors.prizes.yellow.dark': {
    displayTitle: 'Yellow Prize Dark',
    description: 'Dark variant of yellow prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.yellow.dark'
  },
  'colors.prizes.emerald.main': {
    displayTitle: 'Emerald Prize',
    description: 'Main color for emerald prize slots',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.emerald.main'
  },
  'colors.prizes.emerald.light': {
    displayTitle: 'Emerald Prize Light',
    description: 'Light variant of emerald prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.emerald.light'
  },
  'colors.prizes.emerald.dark': {
    displayTitle: 'Emerald Prize Dark',
    description: 'Dark variant of emerald prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.emerald.dark'
  },
  'colors.prizes.blue.main': {
    displayTitle: 'Blue Prize',
    description: 'Main color for blue prize slots',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.blue.main'
  },
  'colors.prizes.blue.light': {
    displayTitle: 'Blue Prize Light',
    description: 'Light variant of blue prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.blue.light'
  },
  'colors.prizes.blue.dark': {
    displayTitle: 'Blue Prize Dark',
    description: 'Dark variant of blue prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.blue.dark'
  },
  'colors.prizes.violet.main': {
    displayTitle: 'Violet Prize',
    description: 'Main color for violet prize slots',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.violet.main'
  },
  'colors.prizes.violet.light': {
    displayTitle: 'Violet Prize Light',
    description: 'Light variant of violet prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.violet.light'
  },
  'colors.prizes.violet.dark': {
    displayTitle: 'Violet Prize Dark',
    description: 'Dark variant of violet prize color',
    type: 'color',
    category: 'Colors - Prizes',
    path: 'colors.prizes.violet.dark'
  },

  // ===========================
  // COLORS - GAME ELEMENTS - BALL
  // ===========================
  'colors.game.ball.primary': {
    displayTitle: 'Ball Primary Color',
    description: 'Primary color for the game ball',
    type: 'color',
    category: 'Colors - Game - Ball',
    path: 'colors.game.ball.primary'
  },
  'colors.game.ball.secondary': {
    displayTitle: 'Ball Secondary Color',
    description: 'Secondary color for ball accents',
    type: 'color',
    category: 'Colors - Game - Ball',
    path: 'colors.game.ball.secondary'
  },
  'colors.game.ball.highlight': {
    displayTitle: 'Ball Highlight Color',
    description: 'Highlight color for ball shine effects',
    type: 'color',
    category: 'Colors - Game - Ball',
    path: 'colors.game.ball.highlight'
  },
  'colors.game.ball.shadow': {
    displayTitle: 'Ball Shadow Color',
    description: 'Shadow color for the ball',
    type: 'color',
    category: 'Colors - Game - Ball',
    path: 'colors.game.ball.shadow'
  },
  'colors.game.ball.borderRadius': {
    displayTitle: 'Ball Border Radius',
    description: 'Border radius for the ball shape',
    type: 'string',
    category: 'Colors - Game - Ball',
    path: 'colors.game.ball.borderRadius'
  },

  // ===========================
  // COLORS - GAME ELEMENTS - PEG
  // ===========================
  'colors.game.peg.default': {
    displayTitle: 'Peg Default Color',
    description: 'Default color for pegs',
    type: 'color',
    category: 'Colors - Game - Peg',
    path: 'colors.game.peg.default'
  },
  'colors.game.peg.active': {
    displayTitle: 'Peg Active Color',
    description: 'Color when a ball collides with a peg',
    type: 'color',
    category: 'Colors - Game - Peg',
    path: 'colors.game.peg.active'
  },
  'colors.game.peg.highlight': {
    displayTitle: 'Peg Highlight Color',
    description: 'Highlight color for peg shine effects',
    type: 'color',
    category: 'Colors - Game - Peg',
    path: 'colors.game.peg.highlight'
  },
  'colors.game.peg.borderRadius': {
    displayTitle: 'Peg Border Radius',
    description: 'Border radius for peg shape',
    type: 'string',
    category: 'Colors - Game - Peg',
    path: 'colors.game.peg.borderRadius'
  },
  'colors.game.peg.shadow': {
    displayTitle: 'Peg Shadow Color',
    description: 'Shadow color for pegs',
    type: 'color',
    category: 'Colors - Game - Peg',
    path: 'colors.game.peg.shadow'
  },

  // ===========================
  // COLORS - GAME ELEMENTS - SLOT
  // ===========================
  'colors.game.slot.border': {
    displayTitle: 'Slot Border Color',
    description: 'Border color for prize slots',
    type: 'color',
    category: 'Colors - Game - Slot',
    path: 'colors.game.slot.border'
  },
  'colors.game.slot.borderWidth': {
    displayTitle: 'Slot Border Width',
    description: 'Border width for prize slots',
    type: 'string',
    category: 'Colors - Game - Slot',
    path: 'colors.game.slot.borderWidth'
  },
  'colors.game.slot.borderRadius': {
    displayTitle: 'Slot Border Radius',
    description: 'Border radius for prize slot shape',
    type: 'string',
    category: 'Colors - Game - Slot',
    path: 'colors.game.slot.borderRadius'
  },
  'colors.game.slot.glow': {
    displayTitle: 'Slot Glow Color',
    description: 'Glow effect color for slots',
    type: 'color',
    category: 'Colors - Game - Slot',
    path: 'colors.game.slot.glow'
  },
  'colors.game.slot.background': {
    displayTitle: 'Slot Background',
    description: 'Background color for prize slots',
    type: 'color',
    category: 'Colors - Game - Slot',
    path: 'colors.game.slot.background'
  },

  // ===========================
  // COLORS - GAME ELEMENTS - LAUNCHER
  // ===========================
  'colors.game.launcher.base': {
    displayTitle: 'Launcher Base Color',
    description: 'Base color for the ball launcher',
    type: 'color',
    category: 'Colors - Game - Launcher',
    path: 'colors.game.launcher.base'
  },
  'colors.game.launcher.track': {
    displayTitle: 'Launcher Track Color',
    description: 'Track color for the launcher mechanism',
    type: 'color',
    category: 'Colors - Game - Launcher',
    path: 'colors.game.launcher.track'
  },
  'colors.game.launcher.accent': {
    displayTitle: 'Launcher Accent Color',
    description: 'Accent color for launcher highlights',
    type: 'color',
    category: 'Colors - Game - Launcher',
    path: 'colors.game.launcher.accent'
  },
  'colors.game.launcher.borderRadius': {
    displayTitle: 'Launcher Border Radius',
    description: 'Border radius for launcher shape',
    type: 'string',
    category: 'Colors - Game - Launcher',
    path: 'colors.game.launcher.borderRadius'
  },

  // ===========================
  // COLORS - GAME ELEMENTS - BOARD
  // ===========================
  'colors.game.board.background': {
    displayTitle: 'Board Background',
    description: 'Background color for the game board',
    type: 'color',
    category: 'Colors - Game - Board',
    path: 'colors.game.board.background'
  },
  'colors.game.board.border': {
    displayTitle: 'Board Border Color',
    description: 'Border color for the game board',
    type: 'color',
    category: 'Colors - Game - Board',
    path: 'colors.game.board.border'
  },
  'colors.game.board.borderRadius': {
    displayTitle: 'Board Border Radius',
    description: 'Border radius for board corners',
    type: 'string',
    category: 'Colors - Game - Board',
    path: 'colors.game.board.borderRadius'
  },
  'colors.game.board.shadow': {
    displayTitle: 'Board Shadow Color',
    description: 'Shadow color for the game board',
    type: 'color',
    category: 'Colors - Game - Board',
    path: 'colors.game.board.shadow'
  },

  // ===========================
  // COLORS - BORDER
  // ===========================
  'colors.border.default': {
    displayTitle: 'Default Border',
    description: 'Default border color for UI elements',
    type: 'color',
    category: 'Colors - Border',
    path: 'colors.border.default'
  },
  'colors.border.light': {
    displayTitle: 'Light Border',
    description: 'Light border color for subtle divisions',
    type: 'color',
    category: 'Colors - Border',
    path: 'colors.border.light'
  },
  'colors.border.dark': {
    displayTitle: 'Dark Border',
    description: 'Dark border color for emphasis',
    type: 'color',
    category: 'Colors - Border',
    path: 'colors.border.dark'
  },
  'colors.border.focus': {
    displayTitle: 'Focus Border',
    description: 'Border color for focused interactive elements',
    type: 'color',
    category: 'Colors - Border',
    path: 'colors.border.focus'
  },

  // ===========================
  // COLORS - SHADOWS
  // ===========================
  'colors.shadows.default': {
    displayTitle: 'Default Shadow',
    description: 'Default shadow color for elevation',
    type: 'color',
    category: 'Colors - Shadows',
    path: 'colors.shadows.default'
  },
  'colors.shadows.colored': {
    displayTitle: 'Colored Shadow',
    description: 'Colored shadow for special effects',
    type: 'color',
    category: 'Colors - Shadows',
    path: 'colors.shadows.colored'
  },
  'colors.shadows.glow': {
    displayTitle: 'Glow Shadow',
    description: 'Glow effect shadow color',
    type: 'color',
    category: 'Colors - Shadows',
    path: 'colors.shadows.glow'
  },

  // ===========================
  // GRADIENTS - BACKGROUNDS
  // ===========================
  'gradients.backgroundMain': {
    displayTitle: 'Main Background Gradient',
    description: 'Primary gradient for main background',
    type: 'gradient',
    category: 'Gradients - Backgrounds',
    path: 'gradients.backgroundMain'
  },
  'gradients.backgroundOverlay': {
    displayTitle: 'Overlay Gradient',
    description: 'Gradient for overlay backgrounds',
    type: 'gradient',
    category: 'Gradients - Backgrounds',
    path: 'gradients.backgroundOverlay'
  },
  'gradients.backgroundCard': {
    displayTitle: 'Card Gradient',
    description: 'Gradient for card backgrounds',
    type: 'gradient',
    category: 'Gradients - Backgrounds',
    path: 'gradients.backgroundCard'
  },
  'gradients.backgroundHeader': {
    displayTitle: 'Header Gradient',
    description: 'Gradient for header backgrounds',
    type: 'gradient',
    category: 'Gradients - Backgrounds',
    path: 'gradients.backgroundHeader'
  },

  // ===========================
  // GRADIENTS - BUTTONS
  // ===========================
  'gradients.buttonPrimary': {
    displayTitle: 'Primary Button Gradient',
    description: 'Gradient for primary buttons',
    type: 'gradient',
    category: 'Gradients - Buttons',
    path: 'gradients.buttonPrimary'
  },
  'gradients.buttonSecondary': {
    displayTitle: 'Secondary Button Gradient',
    description: 'Gradient for secondary buttons',
    type: 'gradient',
    category: 'Gradients - Buttons',
    path: 'gradients.buttonSecondary'
  },
  'gradients.buttonSuccess': {
    displayTitle: 'Success Button Gradient',
    description: 'Gradient for success buttons',
    type: 'gradient',
    category: 'Gradients - Buttons',
    path: 'gradients.buttonSuccess'
  },
  'gradients.buttonDanger': {
    displayTitle: 'Danger Button Gradient',
    description: 'Gradient for danger buttons',
    type: 'gradient',
    category: 'Gradients - Buttons',
    path: 'gradients.buttonDanger'
  },

  // ===========================
  // GRADIENTS - PRIZES
  // ===========================
  'gradients.prizeOrange': {
    displayTitle: 'Orange Prize Gradient',
    description: 'Gradient for orange prize slots',
    type: 'gradient',
    category: 'Gradients - Prizes',
    path: 'gradients.prizeOrange'
  },
  'gradients.prizeYellow': {
    displayTitle: 'Yellow Prize Gradient',
    description: 'Gradient for yellow prize slots',
    type: 'gradient',
    category: 'Gradients - Prizes',
    path: 'gradients.prizeYellow'
  },
  'gradients.prizeEmerald': {
    displayTitle: 'Emerald Prize Gradient',
    description: 'Gradient for emerald prize slots',
    type: 'gradient',
    category: 'Gradients - Prizes',
    path: 'gradients.prizeEmerald'
  },
  'gradients.prizeBlue': {
    displayTitle: 'Blue Prize Gradient',
    description: 'Gradient for blue prize slots',
    type: 'gradient',
    category: 'Gradients - Prizes',
    path: 'gradients.prizeBlue'
  },
  'gradients.prizeViolet': {
    displayTitle: 'Violet Prize Gradient',
    description: 'Gradient for violet prize slots',
    type: 'gradient',
    category: 'Gradients - Prizes',
    path: 'gradients.prizeViolet'
  },

  // ===========================
  // GRADIENTS - EFFECTS
  // ===========================
  'gradients.glow': {
    displayTitle: 'Glow Gradient',
    description: 'Gradient for glow effects',
    type: 'gradient',
    category: 'Gradients - Effects',
    path: 'gradients.glow'
  },
  'gradients.shine': {
    displayTitle: 'Shine Gradient',
    description: 'Gradient for shine effects',
    type: 'gradient',
    category: 'Gradients - Effects',
    path: 'gradients.shine'
  },
  'gradients.shimmer': {
    displayTitle: 'Shimmer Gradient',
    description: 'Gradient for shimmer effects',
    type: 'gradient',
    category: 'Gradients - Effects',
    path: 'gradients.shimmer'
  },

  // ===========================
  // GRADIENTS - GAME ELEMENTS
  // ===========================
  'gradients.ballMain': {
    displayTitle: 'Ball Main Gradient',
    description: 'Main gradient for the game ball',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.ballMain'
  },
  'gradients.ballGlow': {
    displayTitle: 'Ball Glow Gradient',
    description: 'Glow gradient for the ball',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.ballGlow'
  },
  'gradients.pegDefault': {
    displayTitle: 'Peg Default Gradient',
    description: 'Default gradient for pegs',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.pegDefault'
  },
  'gradients.pegActive': {
    displayTitle: 'Peg Active Gradient',
    description: 'Gradient for active pegs',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.pegActive'
  },
  'gradients.slotBackground': {
    displayTitle: 'Slot Background Gradient',
    description: 'Background gradient for prize slots',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.slotBackground'
  },
  'gradients.slotHighlight': {
    displayTitle: 'Slot Highlight Gradient',
    description: 'Highlight gradient for slots',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.slotHighlight'
  },
  'gradients.slotWin': {
    displayTitle: 'Slot Win Gradient',
    description: 'Gradient shown when a slot wins',
    type: 'gradient',
    category: 'Gradients - Game',
    path: 'gradients.slotWin'
  },

  // ===========================
  // GRADIENTS - TEXT
  // ===========================
  'gradients.textGradient': {
    displayTitle: 'Text Gradient',
    description: 'Optional gradient for text effects',
    type: 'gradient',
    category: 'Gradients - Text',
    path: 'gradients.textGradient'
  },
  'gradients.titleGradient': {
    displayTitle: 'Title Gradient',
    description: 'Optional gradient for title text',
    type: 'gradient',
    category: 'Gradients - Text',
    path: 'gradients.titleGradient'
  },

  // ===========================
  // TYPOGRAPHY - FONT FAMILY
  // ===========================
  'typography.fontFamily.primary': {
    displayTitle: 'Primary Font',
    description: 'Primary font family for body text',
    type: 'string',
    category: 'Typography - Font Family',
    path: 'typography.fontFamily.primary'
  },
  'typography.fontFamily.secondary': {
    displayTitle: 'Secondary Font',
    description: 'Optional secondary font for accents',
    type: 'string',
    category: 'Typography - Font Family',
    path: 'typography.fontFamily.secondary'
  },
  'typography.fontFamily.mono': {
    displayTitle: 'Monospace Font',
    description: 'Optional monospace font for code',
    type: 'string',
    category: 'Typography - Font Family',
    path: 'typography.fontFamily.mono'
  },
  'typography.fontFamily.display': {
    displayTitle: 'Display Font',
    description: 'Optional display font for headings',
    type: 'string',
    category: 'Typography - Font Family',
    path: 'typography.fontFamily.display'
  },

  // ===========================
  // TYPOGRAPHY - FONT SIZE
  // ===========================
  'typography.fontSize.xs': {
    displayTitle: 'Extra Small',
    description: 'Extra small font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.xs'
  },
  'typography.fontSize.sm': {
    displayTitle: 'Small',
    description: 'Small font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.sm'
  },
  'typography.fontSize.base': {
    displayTitle: 'Base',
    description: 'Base font size for body text',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.base'
  },
  'typography.fontSize.lg': {
    displayTitle: 'Large',
    description: 'Large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.lg'
  },
  'typography.fontSize.xl': {
    displayTitle: 'Extra Large',
    description: 'Extra large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.xl'
  },
  'typography.fontSize.2xl': {
    displayTitle: '2X Large',
    description: '2X large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.2xl'
  },
  'typography.fontSize.3xl': {
    displayTitle: '3X Large',
    description: '3X large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.3xl'
  },
  'typography.fontSize.4xl': {
    displayTitle: '4X Large',
    description: '4X large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.4xl'
  },
  'typography.fontSize.5xl': {
    displayTitle: '5X Large',
    description: '5X large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.5xl'
  },
  'typography.fontSize.6xl': {
    displayTitle: '6X Large',
    description: '6X large font size',
    type: 'string',
    category: 'Typography - Font Size',
    path: 'typography.fontSize.6xl'
  },

  // ===========================
  // TYPOGRAPHY - FONT WEIGHT
  // ===========================
  'typography.fontWeight.thin': {
    displayTitle: 'Thin',
    description: 'Lightest font weight for delicate text',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.thin',
    min: 100,
    max: 900
  },
  'typography.fontWeight.extralight': {
    displayTitle: 'Extra Light',
    description: 'Very light font weight for subtle text',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.extralight',
    min: 100,
    max: 900
  },
  'typography.fontWeight.light': {
    displayTitle: 'Light',
    description: 'Light font weight for secondary text',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.light',
    min: 100,
    max: 900
  },
  'typography.fontWeight.normal': {
    displayTitle: 'Normal',
    description: 'Standard font weight for body text',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.normal',
    min: 100,
    max: 900
  },
  'typography.fontWeight.medium': {
    displayTitle: 'Medium',
    description: 'Medium font weight for slightly emphasized text',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.medium',
    min: 100,
    max: 900
  },
  'typography.fontWeight.semibold': {
    displayTitle: 'Semi Bold',
    description: 'Semi-bold font weight for subheadings',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.semibold',
    min: 100,
    max: 900
  },
  'typography.fontWeight.bold': {
    displayTitle: 'Bold',
    description: 'Bold font weight for headings and emphasis',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.bold',
    min: 100,
    max: 900
  },
  'typography.fontWeight.extrabold': {
    displayTitle: 'Extra Bold',
    description: 'Very bold font weight for strong emphasis',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.extrabold',
    min: 100,
    max: 900
  },
  'typography.fontWeight.black': {
    displayTitle: 'Black',
    description: 'Heaviest font weight for maximum impact',
    type: 'number',
    category: 'Typography - Font Weight',
    path: 'typography.fontWeight.black',
    min: 100,
    max: 900
  },

  // ===========================
  // TYPOGRAPHY - LINE HEIGHT
  // ===========================
  'typography.lineHeight.none': {
    displayTitle: 'None',
    description: 'Minimal line height for compact text',
    type: 'number',
    category: 'Typography - Line Height',
    path: 'typography.lineHeight.none',
    min: 0.5,
    max: 3
  },
  'typography.lineHeight.tight': {
    displayTitle: 'Tight',
    description: 'Tight line spacing for headings',
    type: 'number',
    category: 'Typography - Line Height',
    path: 'typography.lineHeight.tight',
    min: 0.5,
    max: 3
  },
  'typography.lineHeight.snug': {
    displayTitle: 'Snug',
    description: 'Slightly condensed line spacing',
    type: 'number',
    category: 'Typography - Line Height',
    path: 'typography.lineHeight.snug',
    min: 0.5,
    max: 3
  },
  'typography.lineHeight.normal': {
    displayTitle: 'Normal',
    description: 'Standard line spacing for body text',
    type: 'number',
    category: 'Typography - Line Height',
    path: 'typography.lineHeight.normal',
    min: 0.5,
    max: 3
  },
  'typography.lineHeight.relaxed': {
    displayTitle: 'Relaxed',
    description: 'Comfortable line spacing for readability',
    type: 'number',
    category: 'Typography - Line Height',
    path: 'typography.lineHeight.relaxed',
    min: 0.5,
    max: 3
  },
  'typography.lineHeight.loose': {
    displayTitle: 'Loose',
    description: 'Generous line spacing for maximum readability',
    type: 'number',
    category: 'Typography - Line Height',
    path: 'typography.lineHeight.loose',
    min: 0.5,
    max: 3
  },

  // ===========================
  // TYPOGRAPHY - LETTER SPACING
  // ===========================
  'typography.letterSpacing.tighter': {
    displayTitle: 'Tighter',
    description: 'Condensed letter spacing for compact text',
    type: 'string',
    category: 'Typography - Letter Spacing',
    path: 'typography.letterSpacing.tighter'
  },
  'typography.letterSpacing.tight': {
    displayTitle: 'Tight',
    description: 'Slightly condensed letter spacing',
    type: 'string',
    category: 'Typography - Letter Spacing',
    path: 'typography.letterSpacing.tight'
  },
  'typography.letterSpacing.normal': {
    displayTitle: 'Normal',
    description: 'Standard letter spacing',
    type: 'string',
    category: 'Typography - Letter Spacing',
    path: 'typography.letterSpacing.normal'
  },
  'typography.letterSpacing.wide': {
    displayTitle: 'Wide',
    description: 'Slightly expanded letter spacing',
    type: 'string',
    category: 'Typography - Letter Spacing',
    path: 'typography.letterSpacing.wide'
  },
  'typography.letterSpacing.wider': {
    displayTitle: 'Wider',
    description: 'Expanded letter spacing for emphasis',
    type: 'string',
    category: 'Typography - Letter Spacing',
    path: 'typography.letterSpacing.wider'
  },
  'typography.letterSpacing.widest': {
    displayTitle: 'Widest',
    description: 'Maximum letter spacing for dramatic effect',
    type: 'string',
    category: 'Typography - Letter Spacing',
    path: 'typography.letterSpacing.widest'
  },

  // ===========================
  // BORDER RADIUS
  // ===========================
  'borderRadius.sm': {
    displayTitle: 'Small',
    description: 'Subtle rounded corners',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.sm'
  },
  'borderRadius.md': {
    displayTitle: 'Medium',
    description: 'Moderate rounded corners',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.md'
  },
  'borderRadius.lg': {
    displayTitle: 'Large',
    description: 'Noticeable rounded corners',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.lg'
  },
  'borderRadius.xl': {
    displayTitle: 'Extra Large',
    description: 'Prominent rounded corners',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.xl'
  },
  'borderRadius.2xl': {
    displayTitle: '2X Large',
    description: 'Very rounded corners',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.2xl'
  },
  'borderRadius.3xl': {
    displayTitle: '3X Large',
    description: 'Extremely rounded corners',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.3xl'
  },
  'borderRadius.full': {
    displayTitle: 'Full',
    description: 'Fully rounded (circular/pill shape)',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.full'
  },
  'borderRadius.button': {
    displayTitle: 'Button Radius',
    description: 'Default border radius for buttons',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.button'
  },
  'borderRadius.card': {
    displayTitle: 'Card Radius',
    description: 'Default border radius for cards',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.card'
  },
  'borderRadius.input': {
    displayTitle: 'Input Radius',
    description: 'Default border radius for inputs',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.input'
  },
  'borderRadius.modal': {
    displayTitle: 'Modal Radius',
    description: 'Default border radius for modals',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.modal'
  },
  'borderRadius.badge': {
    displayTitle: 'Badge Radius',
    description: 'Default border radius for badges',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.badge'
  },
  'borderRadius.chip': {
    displayTitle: 'Chip Radius',
    description: 'Default border radius for chips',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.chip'
  },

  // ===========================
  // ANIMATION - DURATION
  // ===========================
  'animation.duration.instant': {
    displayTitle: 'Instant',
    description: 'No animation delay for immediate transitions',
    type: 'number',
    category: 'Animation - Duration',
    path: 'animation.duration.instant',
    min: 0,
    max: 5000,
    unit: 'ms'
  },
  'animation.duration.fast': {
    displayTitle: 'Fast',
    description: 'Quick animation for snappy interactions',
    type: 'number',
    category: 'Animation - Duration',
    path: 'animation.duration.fast',
    min: 0,
    max: 5000,
    unit: 'ms'
  },
  'animation.duration.normal': {
    displayTitle: 'Normal',
    description: 'Standard animation duration for most transitions',
    type: 'number',
    category: 'Animation - Duration',
    path: 'animation.duration.normal',
    min: 0,
    max: 5000,
    unit: 'ms'
  },
  'animation.duration.slow': {
    displayTitle: 'Slow',
    description: 'Slower animation for deliberate transitions',
    type: 'number',
    category: 'Animation - Duration',
    path: 'animation.duration.slow',
    min: 0,
    max: 5000,
    unit: 'ms'
  },
  'animation.duration.slower': {
    displayTitle: 'Slower',
    description: 'Very slow animation for emphasized transitions',
    type: 'number',
    category: 'Animation - Duration',
    path: 'animation.duration.slower',
    min: 0,
    max: 5000,
    unit: 'ms'
  },
  'animation.duration.slowest': {
    displayTitle: 'Slowest',
    description: 'Longest animation for dramatic transitions',
    type: 'number',
    category: 'Animation - Duration',
    path: 'animation.duration.slowest',
    min: 0,
    max: 5000,
    unit: 'ms'
  },

  // ===========================
  // ANIMATION - EASING
  // ===========================
  'animation.easing.linear': {
    displayTitle: 'Linear',
    description: 'Linear easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.linear'
  },
  'animation.easing.easeIn': {
    displayTitle: 'Ease In',
    description: 'Ease in easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.easeIn'
  },
  'animation.easing.easeOut': {
    displayTitle: 'Ease Out',
    description: 'Ease out easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.easeOut'
  },
  'animation.easing.easeInOut': {
    displayTitle: 'Ease In Out',
    description: 'Ease in-out easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.easeInOut'
  },
  'animation.easing.bounce': {
    displayTitle: 'Bounce',
    description: 'Bounce easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.bounce'
  },
  'animation.easing.elastic': {
    displayTitle: 'Elastic',
    description: 'Elastic easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.elastic'
  },
  'animation.easing.sharp': {
    displayTitle: 'Sharp',
    description: 'Sharp easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.sharp'
  },
  'animation.easing.smooth': {
    displayTitle: 'Smooth',
    description: 'Smooth easing function',
    type: 'string',
    category: 'Animation - Easing',
    path: 'animation.easing.smooth'
  },

  // ===========================
  // EFFECTS - GLOWS
  // ===========================
  'effects.glows.sm': {
    displayTitle: 'Small Glow',
    description: 'Small glow effect color',
    type: 'string',
    category: 'Effects - Glows',
    path: 'effects.glows.sm'
  },
  'effects.glows.md': {
    displayTitle: 'Medium Glow',
    description: 'Medium glow effect color',
    type: 'string',
    category: 'Effects - Glows',
    path: 'effects.glows.md'
  },
  'effects.glows.lg': {
    displayTitle: 'Large Glow',
    description: 'Large glow effect color',
    type: 'string',
    category: 'Effects - Glows',
    path: 'effects.glows.lg'
  },
  'effects.glows.colored': {
    displayTitle: 'Colored Glow',
    description: 'Colored glow effect',
    type: 'string',
    category: 'Effects - Glows',
    path: 'effects.glows.colored'
  },
  'effects.glows.success': {
    displayTitle: 'Success Glow',
    description: 'Success-colored glow effect',
    type: 'string',
    category: 'Effects - Glows',
    path: 'effects.glows.success'
  },
  'effects.glows.error': {
    displayTitle: 'Error Glow',
    description: 'Error-colored glow effect',
    type: 'string',
    category: 'Effects - Glows',
    path: 'effects.glows.error'
  },

  // ===========================
  // EFFECTS - BORDERS
  // ===========================
  'effects.borders.none': {
    displayTitle: 'No Border',
    description: 'No border style',
    type: 'string',
    category: 'Effects - Borders',
    path: 'effects.borders.none'
  },
  'effects.borders.thin': {
    displayTitle: 'Thin Border',
    description: 'Thin border style',
    type: 'string',
    category: 'Effects - Borders',
    path: 'effects.borders.thin'
  },
  'effects.borders.medium': {
    displayTitle: 'Medium Border',
    description: 'Medium border style',
    type: 'string',
    category: 'Effects - Borders',
    path: 'effects.borders.medium'
  },
  'effects.borders.thick': {
    displayTitle: 'Thick Border',
    description: 'Thick border style',
    type: 'string',
    category: 'Effects - Borders',
    path: 'effects.borders.thick'
  },
  'effects.borders.dashed': {
    displayTitle: 'Dashed Border',
    description: 'Dashed border style',
    type: 'string',
    category: 'Effects - Borders',
    path: 'effects.borders.dashed'
  },
  'effects.borders.dotted': {
    displayTitle: 'Dotted Border',
    description: 'Dotted border style',
    type: 'string',
    category: 'Effects - Borders',
    path: 'effects.borders.dotted'
  },

  // ===========================
  // EFFECTS - TRANSITIONS
  // ===========================
  'effects.transitions.fast': {
    displayTitle: 'Fast Transition',
    description: 'Fast transition timing',
    type: 'string',
    category: 'Effects - Transitions',
    path: 'effects.transitions.fast'
  },
  'effects.transitions.normal': {
    displayTitle: 'Normal Transition',
    description: 'Normal transition timing',
    type: 'string',
    category: 'Effects - Transitions',
    path: 'effects.transitions.normal'
  },
  'effects.transitions.slow': {
    displayTitle: 'Slow Transition',
    description: 'Slow transition timing',
    type: 'string',
    category: 'Effects - Transitions',
    path: 'effects.transitions.slow'
  },

  // ===========================
  // BUTTONS - PRIMARY
  // ===========================
  'buttons.primary.background': {
    displayTitle: 'Primary Button Background',
    description: 'Background color for primary buttons',
    type: 'color',
    category: 'Buttons - Primary',
    path: 'buttons.primary.background'
  },
  'buttons.primary.backgroundHover': {
    displayTitle: 'Primary Button Hover',
    description: 'Background color on hover',
    type: 'color',
    category: 'Buttons - Primary',
    path: 'buttons.primary.backgroundHover'
  },
  'buttons.primary.backgroundActive': {
    displayTitle: 'Primary Button Active',
    description: 'Background color when active',
    type: 'color',
    category: 'Buttons - Primary',
    path: 'buttons.primary.backgroundActive'
  },
  'buttons.primary.border': {
    displayTitle: 'Primary Button Border',
    description: 'Border color for primary buttons',
    type: 'color',
    category: 'Buttons - Primary',
    path: 'buttons.primary.border'
  },
  'buttons.primary.borderWidth': {
    displayTitle: 'Primary Button Border Width',
    description: 'Border width for primary buttons',
    type: 'string',
    category: 'Buttons - Primary',
    path: 'buttons.primary.borderWidth'
  },
  'buttons.primary.borderRadius': {
    displayTitle: 'Primary Button Border Radius',
    description: 'Border radius for primary buttons',
    type: 'string',
    category: 'Buttons - Primary',
    path: 'buttons.primary.borderRadius'
  },
  'buttons.primary.color': {
    displayTitle: 'Primary Button Text Color',
    description: 'Text color for primary buttons',
    type: 'color',
    category: 'Buttons - Primary',
    path: 'buttons.primary.color'
  },
  'buttons.primary.colorHover': {
    displayTitle: 'Primary Button Text Hover',
    description: 'Text color on hover',
    type: 'color',
    category: 'Buttons - Primary',
    path: 'buttons.primary.colorHover'
  },
  'buttons.primary.fontSize': {
    displayTitle: 'Primary Button Font Size',
    description: 'Font size for primary buttons',
    type: 'string',
    category: 'Buttons - Primary',
    path: 'buttons.primary.fontSize'
  },
  'buttons.primary.fontWeight': {
    displayTitle: 'Primary Button Font Weight',
    description: 'Font weight for primary buttons',
    type: 'number',
    category: 'Buttons - Primary',
    path: 'buttons.primary.fontWeight',
    min: 100,
    max: 900
  },
  'buttons.primary.transition': {
    displayTitle: 'Primary Button Transition',
    description: 'Transition timing for primary buttons',
    type: 'string',
    category: 'Buttons - Primary',
    path: 'buttons.primary.transition'
  },

  // ===========================
  // BUTTONS - SECONDARY
  // ===========================
  'buttons.secondary.background': {
    displayTitle: 'Secondary Button Background',
    description: 'Background color for secondary buttons',
    type: 'color',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.background'
  },
  'buttons.secondary.backgroundHover': {
    displayTitle: 'Secondary Button Hover',
    description: 'Background color on hover',
    type: 'color',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.backgroundHover'
  },
  'buttons.secondary.backgroundActive': {
    displayTitle: 'Secondary Button Active',
    description: 'Background color when active',
    type: 'color',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.backgroundActive'
  },
  'buttons.secondary.border': {
    displayTitle: 'Secondary Button Border',
    description: 'Border color for secondary buttons',
    type: 'color',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.border'
  },
  'buttons.secondary.borderWidth': {
    displayTitle: 'Secondary Button Border Width',
    description: 'Border width for secondary buttons',
    type: 'string',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.borderWidth'
  },
  'buttons.secondary.borderRadius': {
    displayTitle: 'Secondary Button Border Radius',
    description: 'Border radius for secondary buttons',
    type: 'string',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.borderRadius'
  },
  'buttons.secondary.color': {
    displayTitle: 'Secondary Button Text Color',
    description: 'Text color for secondary buttons',
    type: 'color',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.color'
  },
  'buttons.secondary.colorHover': {
    displayTitle: 'Secondary Button Text Hover',
    description: 'Text color on hover',
    type: 'color',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.colorHover'
  },
  'buttons.secondary.fontSize': {
    displayTitle: 'Secondary Button Font Size',
    description: 'Font size for secondary buttons',
    type: 'string',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.fontSize'
  },
  'buttons.secondary.fontWeight': {
    displayTitle: 'Secondary Button Font Weight',
    description: 'Font weight for secondary buttons',
    type: 'number',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.fontWeight',
    min: 100,
    max: 900
  },
  'buttons.secondary.transition': {
    displayTitle: 'Secondary Button Transition',
    description: 'Transition timing for secondary buttons',
    type: 'string',
    category: 'Buttons - Secondary',
    path: 'buttons.secondary.transition'
  },

  // ===========================
  // BUTTONS - OUTLINE
  // ===========================
  'buttons.outline.background': {
    displayTitle: 'Outline Button Background',
    description: 'Background color for outline buttons',
    type: 'color',
    category: 'Buttons - Outline',
    path: 'buttons.outline.background'
  },
  'buttons.outline.backgroundHover': {
    displayTitle: 'Outline Button Hover',
    description: 'Background color on hover',
    type: 'color',
    category: 'Buttons - Outline',
    path: 'buttons.outline.backgroundHover'
  },
  'buttons.outline.backgroundActive': {
    displayTitle: 'Outline Button Active',
    description: 'Background color when active',
    type: 'color',
    category: 'Buttons - Outline',
    path: 'buttons.outline.backgroundActive'
  },
  'buttons.outline.border': {
    displayTitle: 'Outline Button Border',
    description: 'Border color for outline buttons',
    type: 'color',
    category: 'Buttons - Outline',
    path: 'buttons.outline.border'
  },
  'buttons.outline.borderWidth': {
    displayTitle: 'Outline Button Border Width',
    description: 'Border width for outline buttons',
    type: 'string',
    category: 'Buttons - Outline',
    path: 'buttons.outline.borderWidth'
  },
  'buttons.outline.borderRadius': {
    displayTitle: 'Outline Button Border Radius',
    description: 'Border radius for outline buttons',
    type: 'string',
    category: 'Buttons - Outline',
    path: 'buttons.outline.borderRadius'
  },
  'buttons.outline.color': {
    displayTitle: 'Outline Button Text Color',
    description: 'Text color for outline buttons',
    type: 'color',
    category: 'Buttons - Outline',
    path: 'buttons.outline.color'
  },
  'buttons.outline.colorHover': {
    displayTitle: 'Outline Button Text Hover',
    description: 'Text color on hover',
    type: 'color',
    category: 'Buttons - Outline',
    path: 'buttons.outline.colorHover'
  },
  'buttons.outline.fontSize': {
    displayTitle: 'Outline Button Font Size',
    description: 'Font size for outline buttons',
    type: 'string',
    category: 'Buttons - Outline',
    path: 'buttons.outline.fontSize'
  },
  'buttons.outline.fontWeight': {
    displayTitle: 'Outline Button Font Weight',
    description: 'Font weight for outline buttons',
    type: 'number',
    category: 'Buttons - Outline',
    path: 'buttons.outline.fontWeight',
    min: 100,
    max: 900
  },
  'buttons.outline.transition': {
    displayTitle: 'Outline Button Transition',
    description: 'Transition timing for outline buttons',
    type: 'string',
    category: 'Buttons - Outline',
    path: 'buttons.outline.transition'
  },

  // ===========================
  // BUTTONS - GHOST
  // ===========================
  'buttons.ghost.background': {
    displayTitle: 'Ghost Button Background',
    description: 'Background color for ghost buttons',
    type: 'color',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.background'
  },
  'buttons.ghost.backgroundHover': {
    displayTitle: 'Ghost Button Hover',
    description: 'Background color on hover',
    type: 'color',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.backgroundHover'
  },
  'buttons.ghost.backgroundActive': {
    displayTitle: 'Ghost Button Active',
    description: 'Background color when active',
    type: 'color',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.backgroundActive'
  },
  'buttons.ghost.border': {
    displayTitle: 'Ghost Button Border',
    description: 'Border color for ghost buttons',
    type: 'color',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.border'
  },
  'buttons.ghost.borderWidth': {
    displayTitle: 'Ghost Button Border Width',
    description: 'Border width for ghost buttons',
    type: 'string',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.borderWidth'
  },
  'buttons.ghost.borderRadius': {
    displayTitle: 'Ghost Button Border Radius',
    description: 'Border radius for ghost buttons',
    type: 'string',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.borderRadius'
  },
  'buttons.ghost.color': {
    displayTitle: 'Ghost Button Text Color',
    description: 'Text color for ghost buttons',
    type: 'color',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.color'
  },
  'buttons.ghost.colorHover': {
    displayTitle: 'Ghost Button Text Hover',
    description: 'Text color on hover',
    type: 'color',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.colorHover'
  },
  'buttons.ghost.fontSize': {
    displayTitle: 'Ghost Button Font Size',
    description: 'Font size for ghost buttons',
    type: 'string',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.fontSize'
  },
  'buttons.ghost.fontWeight': {
    displayTitle: 'Ghost Button Font Weight',
    description: 'Font weight for ghost buttons',
    type: 'number',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.fontWeight',
    min: 100,
    max: 900
  },
  'buttons.ghost.transition': {
    displayTitle: 'Ghost Button Transition',
    description: 'Transition timing for ghost buttons',
    type: 'string',
    category: 'Buttons - Ghost',
    path: 'buttons.ghost.transition'
  },

  // ===========================
  // BUTTONS - DANGER
  // ===========================
  'buttons.danger.background': {
    displayTitle: 'Danger Button Background',
    description: 'Background color for danger buttons',
    type: 'color',
    category: 'Buttons - Danger',
    path: 'buttons.danger.background'
  },
  'buttons.danger.backgroundHover': {
    displayTitle: 'Danger Button Hover',
    description: 'Background color on hover',
    type: 'color',
    category: 'Buttons - Danger',
    path: 'buttons.danger.backgroundHover'
  },
  'buttons.danger.backgroundActive': {
    displayTitle: 'Danger Button Active',
    description: 'Background color when active',
    type: 'color',
    category: 'Buttons - Danger',
    path: 'buttons.danger.backgroundActive'
  },
  'buttons.danger.border': {
    displayTitle: 'Danger Button Border',
    description: 'Border color for danger buttons',
    type: 'color',
    category: 'Buttons - Danger',
    path: 'buttons.danger.border'
  },
  'buttons.danger.borderWidth': {
    displayTitle: 'Danger Button Border Width',
    description: 'Border width for danger buttons',
    type: 'string',
    category: 'Buttons - Danger',
    path: 'buttons.danger.borderWidth'
  },
  'buttons.danger.borderRadius': {
    displayTitle: 'Danger Button Border Radius',
    description: 'Border radius for danger buttons',
    type: 'string',
    category: 'Buttons - Danger',
    path: 'buttons.danger.borderRadius'
  },
  'buttons.danger.color': {
    displayTitle: 'Danger Button Text Color',
    description: 'Text color for danger buttons',
    type: 'color',
    category: 'Buttons - Danger',
    path: 'buttons.danger.color'
  },
  'buttons.danger.colorHover': {
    displayTitle: 'Danger Button Text Hover',
    description: 'Text color on hover',
    type: 'color',
    category: 'Buttons - Danger',
    path: 'buttons.danger.colorHover'
  },
  'buttons.danger.fontSize': {
    displayTitle: 'Danger Button Font Size',
    description: 'Font size for danger buttons',
    type: 'string',
    category: 'Buttons - Danger',
    path: 'buttons.danger.fontSize'
  },
  'buttons.danger.fontWeight': {
    displayTitle: 'Danger Button Font Weight',
    description: 'Font weight for danger buttons',
    type: 'number',
    category: 'Buttons - Danger',
    path: 'buttons.danger.fontWeight',
    min: 100,
    max: 900
  },
  'buttons.danger.transition': {
    displayTitle: 'Danger Button Transition',
    description: 'Transition timing for danger buttons',
    type: 'string',
    category: 'Buttons - Danger',
    path: 'buttons.danger.transition'
  },

  // ===========================
  // BUTTONS - SUCCESS
  // ===========================
  'buttons.success.background': {
    displayTitle: 'Success Button Background',
    description: 'Background color for success buttons',
    type: 'color',
    category: 'Buttons - Success',
    path: 'buttons.success.background'
  },
  'buttons.success.backgroundHover': {
    displayTitle: 'Success Button Hover',
    description: 'Background color on hover',
    type: 'color',
    category: 'Buttons - Success',
    path: 'buttons.success.backgroundHover'
  },
  'buttons.success.backgroundActive': {
    displayTitle: 'Success Button Active',
    description: 'Background color when active',
    type: 'color',
    category: 'Buttons - Success',
    path: 'buttons.success.backgroundActive'
  },
  'buttons.success.border': {
    displayTitle: 'Success Button Border',
    description: 'Border color for success buttons',
    type: 'color',
    category: 'Buttons - Success',
    path: 'buttons.success.border'
  },
  'buttons.success.borderWidth': {
    displayTitle: 'Success Button Border Width',
    description: 'Border width for success buttons',
    type: 'string',
    category: 'Buttons - Success',
    path: 'buttons.success.borderWidth'
  },
  'buttons.success.borderRadius': {
    displayTitle: 'Success Button Border Radius',
    description: 'Border radius for success buttons',
    type: 'string',
    category: 'Buttons - Success',
    path: 'buttons.success.borderRadius'
  },
  'buttons.success.color': {
    displayTitle: 'Success Button Text Color',
    description: 'Text color for success buttons',
    type: 'color',
    category: 'Buttons - Success',
    path: 'buttons.success.color'
  },
  'buttons.success.colorHover': {
    displayTitle: 'Success Button Text Hover',
    description: 'Text color on hover',
    type: 'color',
    category: 'Buttons - Success',
    path: 'buttons.success.colorHover'
  },
  'buttons.success.fontSize': {
    displayTitle: 'Success Button Font Size',
    description: 'Font size for success buttons',
    type: 'string',
    category: 'Buttons - Success',
    path: 'buttons.success.fontSize'
  },
  'buttons.success.fontWeight': {
    displayTitle: 'Success Button Font Weight',
    description: 'Font weight for success buttons',
    type: 'number',
    category: 'Buttons - Success',
    path: 'buttons.success.fontWeight',
    min: 100,
    max: 900
  },
  'buttons.success.transition': {
    displayTitle: 'Success Button Transition',
    description: 'Transition timing for success buttons',
    type: 'string',
    category: 'Buttons - Success',
    path: 'buttons.success.transition'
  },

  // ===========================
  // COMPONENTS - CARD
  // ===========================
  'components.card.background': {
    displayTitle: 'Card Background',
    description: 'Background color for cards',
    type: 'color',
    category: 'Components - Card',
    path: 'components.card.background'
  },
  'components.card.border': {
    displayTitle: 'Card Border',
    description: 'Border color for cards',
    type: 'color',
    category: 'Components - Card',
    path: 'components.card.border'
  },
  'components.card.borderWidth': {
    displayTitle: 'Card Border Width',
    description: 'Border width for cards',
    type: 'string',
    category: 'Components - Card',
    path: 'components.card.borderWidth'
  },
  'components.card.borderRadius': {
    displayTitle: 'Card Border Radius',
    description: 'Border radius for cards',
    type: 'string',
    category: 'Components - Card',
    path: 'components.card.borderRadius'
  },
  'components.card.padding': {
    displayTitle: 'Card Padding',
    description: 'Padding for card content',
    type: 'string',
    category: 'Components - Card',
    path: 'components.card.padding'
  },

  // ===========================
  // COMPONENTS - MODAL
  // ===========================
  'components.modal.background': {
    displayTitle: 'Modal Background',
    description: 'Background color for modals',
    type: 'color',
    category: 'Components - Modal',
    path: 'components.modal.background'
  },
  'components.modal.backdropColor': {
    displayTitle: 'Modal Backdrop',
    description: 'Backdrop overlay color for modals',
    type: 'color',
    category: 'Components - Modal',
    path: 'components.modal.backdropColor'
  },
  'components.modal.borderRadius': {
    displayTitle: 'Modal Border Radius',
    description: 'Border radius for modals',
    type: 'string',
    category: 'Components - Modal',
    path: 'components.modal.borderRadius'
  },
  'components.modal.padding': {
    displayTitle: 'Modal Padding',
    description: 'Padding for modal content',
    type: 'string',
    category: 'Components - Modal',
    path: 'components.modal.padding'
  },

  // ===========================
  // COMPONENTS - HEADER
  // ===========================
  'components.header.height': {
    displayTitle: 'Header Height',
    description: 'Height of the header',
    type: 'string',
    category: 'Components - Header',
    path: 'components.header.height'
  },
  'components.header.background': {
    displayTitle: 'Header Background',
    description: 'Background color for header',
    type: 'color',
    category: 'Components - Header',
    path: 'components.header.background'
  },
  'components.header.borderBottom': {
    displayTitle: 'Header Border Bottom',
    description: 'Bottom border for header',
    type: 'string',
    category: 'Components - Header',
    path: 'components.header.borderBottom'
  },

  // ===========================
  // COMPONENTS - INPUT
  // ===========================
  'components.input.background': {
    displayTitle: 'Input Background',
    description: 'Background color for inputs',
    type: 'color',
    category: 'Components - Input',
    path: 'components.input.background'
  },
  'components.input.border': {
    displayTitle: 'Input Border',
    description: 'Border color for inputs',
    type: 'color',
    category: 'Components - Input',
    path: 'components.input.border'
  },
  'components.input.borderRadius': {
    displayTitle: 'Input Border Radius',
    description: 'Border radius for inputs',
    type: 'string',
    category: 'Components - Input',
    path: 'components.input.borderRadius'
  },
  'components.input.borderFocus': {
    displayTitle: 'Input Focus Border',
    description: 'Border color when input is focused',
    type: 'color',
    category: 'Components - Input',
    path: 'components.input.borderFocus'
  },
  'components.input.padding': {
    displayTitle: 'Input Padding',
    description: 'Padding for input content',
    type: 'string',
    category: 'Components - Input',
    path: 'components.input.padding'
  },

  // ===========================
  // COMPONENTS - DROPDOWN
  // ===========================
  'components.dropdown.background': {
    displayTitle: 'Dropdown Background',
    description: 'Background color for dropdowns',
    type: 'color',
    category: 'Components - Dropdown',
    path: 'components.dropdown.background'
  },
  'components.dropdown.border': {
    displayTitle: 'Dropdown Border',
    description: 'Border color for dropdowns',
    type: 'color',
    category: 'Components - Dropdown',
    path: 'components.dropdown.border'
  },
  'components.dropdown.borderRadius': {
    displayTitle: 'Dropdown Border Radius',
    description: 'Border radius for dropdowns',
    type: 'string',
    category: 'Components - Dropdown',
    path: 'components.dropdown.borderRadius'
  },
  'components.dropdown.itemHover': {
    displayTitle: 'Dropdown Item Hover',
    description: 'Background color for dropdown items on hover',
    type: 'color',
    category: 'Components - Dropdown',
    path: 'components.dropdown.itemHover'
  },

  // ===========================
  // COMPONENTS - TOOLTIP
  // ===========================
  'components.tooltip.background': {
    displayTitle: 'Tooltip Background',
    description: 'Background color for tooltips',
    type: 'color',
    category: 'Components - Tooltip',
    path: 'components.tooltip.background'
  },
  'components.tooltip.color': {
    displayTitle: 'Tooltip Text Color',
    description: 'Text color for tooltips',
    type: 'color',
    category: 'Components - Tooltip',
    path: 'components.tooltip.color'
  },
  'components.tooltip.borderRadius': {
    displayTitle: 'Tooltip Border Radius',
    description: 'Border radius for tooltips',
    type: 'string',
    category: 'Components - Tooltip',
    path: 'components.tooltip.borderRadius'
  },
  'components.tooltip.padding': {
    displayTitle: 'Tooltip Padding',
    description: 'Padding for tooltip content',
    type: 'string',
    category: 'Components - Tooltip',
    path: 'components.tooltip.padding'
  },
  'components.tooltip.fontSize': {
    displayTitle: 'Tooltip Font Size',
    description: 'Font size for tooltip text',
    type: 'string',
    category: 'Components - Tooltip',
    path: 'components.tooltip.fontSize'
  },

  // ===========================
  // LAYOUT - BREAKPOINTS
  // ===========================
  'breakpoints.xs': {
    displayTitle: 'Extra Small Breakpoint',
    description: 'Breakpoint for extra small screens',
    type: 'string',
    category: 'Layout - Breakpoints',
    path: 'breakpoints.xs'
  },
  'breakpoints.sm': {
    displayTitle: 'Small Breakpoint',
    description: 'Breakpoint for small screens',
    type: 'string',
    category: 'Layout - Breakpoints',
    path: 'breakpoints.sm'
  },
  'breakpoints.md': {
    displayTitle: 'Medium Breakpoint',
    description: 'Breakpoint for medium screens',
    type: 'string',
    category: 'Layout - Breakpoints',
    path: 'breakpoints.md'
  },
  'breakpoints.lg': {
    displayTitle: 'Large Breakpoint',
    description: 'Breakpoint for large screens',
    type: 'string',
    category: 'Layout - Breakpoints',
    path: 'breakpoints.lg'
  },
  'breakpoints.xl': {
    displayTitle: 'Extra Large Breakpoint',
    description: 'Breakpoint for extra large screens',
    type: 'string',
    category: 'Layout - Breakpoints',
    path: 'breakpoints.xl'
  },
  'breakpoints.2xl': {
    displayTitle: '2X Large Breakpoint',
    description: 'Breakpoint for 2X large screens',
    type: 'string',
    category: 'Layout - Breakpoints',
    path: 'breakpoints.2xl'
  },

  // ===========================
  // LAYOUT - Z-INDEX
  // ===========================
  'zIndex.dropdown': {
    displayTitle: 'Dropdown Z-Index',
    description: 'Z-index for dropdown menus',
    type: 'number',
    category: 'Layout - Z-Index',
    path: 'zIndex.dropdown',
    min: -100,
    max: 10000
  },
  'zIndex.modal': {
    displayTitle: 'Modal Z-Index',
    description: 'Z-index for modals',
    type: 'number',
    category: 'Layout - Z-Index',
    path: 'zIndex.modal',
    min: -100,
    max: 10000
  },
  'zIndex.popover': {
    displayTitle: 'Popover Z-Index',
    description: 'Z-index for popovers',
    type: 'number',
    category: 'Layout - Z-Index',
    path: 'zIndex.popover',
    min: -100,
    max: 10000
  },
  'zIndex.tooltip': {
    displayTitle: 'Tooltip Z-Index',
    description: 'Z-index for tooltips',
    type: 'number',
    category: 'Layout - Z-Index',
    path: 'zIndex.tooltip',
    min: -100,
    max: 10000
  },
  'zIndex.notification': {
    displayTitle: 'Notification Z-Index',
    description: 'Z-index for notifications',
    type: 'number',
    category: 'Layout - Z-Index',
    path: 'zIndex.notification',
    min: -100,
    max: 10000
  }
};

/**
 * Utility function to get metadata by path
 */
export function getMetadataByPath(path: string): ThemePropertyMetadata | undefined {
  return themeMetadata[path];
}

/**
 * Utility function to get all metadata for a category
 */
export function getMetadataByCategory(category: string): Record<string, ThemePropertyMetadata> {
  return Object.entries(themeMetadata)
    .filter(([, metadata]) => metadata.category === category)
    .reduce<Record<string, ThemePropertyMetadata>>((acc, [key, metadata]) => {
      acc[key] = metadata;
      return acc;
    }, {});
}

/**
 * Utility function to get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  Object.values(themeMetadata).forEach(metadata => {
    categories.add(metadata.category);
  });
  return Array.from(categories).sort();
}
