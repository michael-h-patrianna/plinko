/**
 * Theme Metadata Schema
 * Provides metadata for every theme property to enable dynamic form generation in the theme editor UI
 *
 * Total metadata entries: ~72 (pruned to match actual usage in Plinko game)
 *
 * PRUNED SECTIONS (removed unused properties):
 * - Removed all spacing.* entries (not editable in theme editor)
 * - Removed all animation.* entries (not used in current implementation)
 * - Removed all breakpoints.* entries (not used in current implementation)
 * - Removed unused color properties (background.tertiary, overlay, primary.dark, accent.dark, accent.contrast, text.link, text.linkHover, status.info, border.dark, border.focus, shadows.colored, shadows.glow, game ball/peg/slot/board unused properties)
 * - Removed unused gradient properties (backgroundMain, backgroundOverlay, backgroundHeader, buttonSecondary, buttonSuccess, shimmer, pegActive, slotBackground, slotHighlight, slotWin, textGradient)
 * - Removed all effects.glows.* and effects.borders.* entries
 * - Removed effects.transitions.normal and effects.transitions.slow
 * - Removed all typography except fontFamily.primary and fontFamily.display
 * - Removed all borderRadius except sm and card
 * - Removed all button variants except primary and secondary
 * - Removed all component properties except card (background, border, borderRadius) and modal (background, borderRadius)
 * - Removed all zIndex except 30, 40, 50
 *
 * KEPT (actually used in Plinko game):
 * - Core colors: background, surface, primary, accent, text, status
 * - Prize colors: orange, yellow, emerald, blue, violet (main, light, dark)
 * - Game element colors: ball, peg, slot, launcher, board (used properties only)
 * - Border and shadow colors (used properties only)
 * - Gradients: backgroundCard, buttonPrimary, buttonDanger, prize gradients, glow, shine, ball/peg gradients, titleGradient
 * - Typography: fontFamily.primary, fontFamily.display
 * - Border radius: sm, card
 * - Effects: transitions.fast
 * - Buttons: primary, secondary (all nested properties)
 * - Components: card, modal (used properties only)
 * - Z-index: 30, 40, 50
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

  // ===========================
  // GRADIENTS - BACKGROUNDS
  // ===========================
  'gradients.backgroundCard': {
    displayTitle: 'Card Gradient',
    description: 'Gradient for card backgrounds',
    type: 'gradient',
    category: 'Gradients - Backgrounds',
    path: 'gradients.backgroundCard'
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

  // ===========================
  // GRADIENTS - TEXT
  // ===========================
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
  'typography.fontFamily.display': {
    displayTitle: 'Display Font',
    description: 'Optional display font for headings',
    type: 'string',
    category: 'Typography - Font Family',
    path: 'typography.fontFamily.display'
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
  'borderRadius.card': {
    displayTitle: 'Card Radius',
    description: 'Default border radius for cards',
    type: 'string',
    category: 'Border Radius',
    path: 'borderRadius.card'
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
  'components.card.borderRadius': {
    displayTitle: 'Card Border Radius',
    description: 'Border radius for cards',
    type: 'string',
    category: 'Components - Card',
    path: 'components.card.borderRadius'
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
  'components.modal.borderRadius': {
    displayTitle: 'Modal Border Radius',
    description: 'Border radius for modals',
    type: 'string',
    category: 'Components - Modal',
    path: 'components.modal.borderRadius'
  },
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
