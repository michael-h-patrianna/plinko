/**
 * DEV TOOLS ONLY - Not part of production Plinko game
 *
 * ThemeEditor provides a drawer interface for editing theme properties.
 * This is demo UI (NOT Plinko UI), so it uses hardcoded styles and does NOT
 * consume the theme context.
 *
 * Features:
 * - Slides in from right with cross-platform safe animations
 * - Accessible (focus trap, ESC to close, ARIA labels)
 * - Responsive (full width on mobile)
 * - Overlay click to close
 * - Dynamic form generation from theme metadata
 * - Import/export theme files
 *
 * CRITICAL: Uses ONLY hardcoded styles - NO theme context
 */

import { useTheme } from '@plinko/theme';
import { getAllCategories, getMetadataByCategory, type ThemePropertyMetadata } from '@plinko/theme/themeMetadata';
import { exportThemeToFile, importThemeFromFile } from '@plinko/theme/themeSerializer';
import type { Theme } from '@plinko/theme/types';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorInput, GradientInput, NumberInput, SelectInput, StringInput } from './ThemePropertyInputs';

interface ThemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hardcoded styles - NOT from theme context
const STYLES = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: '#1a1a1a',
    width: '600px',
    borderLeft: '1px solid #333333',
    zIndex: 10000,
  },
  header: {
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333333',
    color: '#ffffff',
  },
  content: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  footer: {
    backgroundColor: '#1a1a1a',
    borderTop: '1px solid #333333',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: '1px solid #2563eb',
  },
  secondaryButton: {
    backgroundColor: '#666666',
    color: '#ffffff',
    border: '1px solid #555555',
  },
  closeButton: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    border: 'none',
  },
  accordion: {
    header: {
      backgroundColor: '#2a2a2a',
      borderBottom: '1px solid #444444',
      padding: '12px 16px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 600,
    },
    content: {
      padding: '16px',
      borderBottom: '1px solid #333333',
    },
    arrow: {
      transition: 'transform 0.2s ease',
      fontSize: '12px',
      color: '#999999',
    },
  },
  propertyContainer: {
    marginBottom: '8px',
  },
} as const;

/**
 * Helper function to get value from nested object by dot notation path
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    // Type guard: ensure current is an object before accessing properties
    if (typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Helper function to set value in nested object by dot notation path
 */
function setValueByPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split('.');
  const newObj = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>; // Deep clone
  let current: Record<string, unknown> = newObj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!part) continue; // Skip empty parts
    if (current[part] === undefined) {
      current[part] = {};
    }
    // Navigate to next level, ensuring it's an object
    const next = current[part];
    if (typeof next === 'object' && next !== null && !Array.isArray(next)) {
      current = next as Record<string, unknown>;
    }
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    current[lastPart] = value;
  }
  return newObj;
}

/**
 * AccordionSection component for collapsible sections
 */
interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div style={{ marginBottom: '1px' }}>
      <div
        onClick={onToggle}
        style={STYLES.accordion.header}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <span>{title}</span>
        <span
          style={{
            ...STYLES.accordion.arrow,
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
      </div>
      {isOpen && (
        <div style={STYLES.accordion.content}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * PropertyInput component that renders the appropriate input based on metadata type
 */
interface PropertyInputProps {
  metadata: ThemePropertyMetadata;
  value: unknown;
  onChange: (value: unknown) => void;
}

function PropertyInput({ metadata, value, onChange }: PropertyInputProps) {
  const { type, displayTitle, description, options, min, max, unit } = metadata;

  switch (type) {
    case 'color':
      return (
        <ColorInput
          label={displayTitle}
          value={typeof value === 'string' ? value : '#000000'}
          onChange={onChange}
          description={description}
        />
      );
    case 'number':
      return (
        <NumberInput
          label={displayTitle}
          value={typeof value === 'number' ? value : 0}
          onChange={onChange}
          min={min}
          max={max}
          unit={unit}
          description={description}
        />
      );
    case 'string':
      return (
        <StringInput
          label={displayTitle}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          description={description}
        />
      );
    case 'select':
      return options ? (
        <SelectInput
          label={displayTitle}
          value={typeof value === 'string' ? value : (options[0] || '')}
          onChange={onChange}
          options={options}
          description={description}
        />
      ) : null;
    case 'gradient':
      return (
        <GradientInput
          label={displayTitle}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          description={description}
        />
      );
    case 'boolean':
      return (
        <div style={STYLES.propertyContainer}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: '#ffffff', fontSize: '13px' }}>{displayTitle}</span>
          </label>
          {description && (
            <p style={{ color: '#999999', fontSize: '11px', marginTop: '4px', marginLeft: '24px' }}>
              {description}
            </p>
          )}
        </div>
      );
    case 'object':
      // Skip objects for now - too complex
      return null;
    default:
      return null;
  }
}

export default function ThemeEditor({ isOpen, onClose }: ThemeEditorProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get theme context
  const { theme, setTheme } = useTheme();

  // Track the original theme for reset functionality
  const [initialTheme, setInitialTheme] = useState<Theme>(theme);

  // Local state for editing (updates theme context in real-time)
  const [editedTheme, setEditedTheme] = useState<Theme>(theme);

  // Track which accordion sections are open (default: Basic Info is open)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Basic Info']));

  // Get all categories from metadata
  const categories = getAllCategories();

  // Update both editedTheme and initialTheme when theme changes externally
  useEffect(() => {
    setEditedTheme(theme);
    setInitialTheme(theme);
  }, [theme]);

  // Toggle accordion section
  const toggleSection = useCallback((category: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // Handle property change - applies changes in real-time
  const handleChange = useCallback((path: string, value: unknown) => {
    const newTheme = setValueByPath(editedTheme as unknown as Record<string, unknown>, path, value) as unknown as Theme;
    setEditedTheme(newTheme);
    setTheme(newTheme); // Apply immediately!
  }, [editedTheme, setTheme]);

  // Handle Load Theme
  const handleLoadTheme = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    void (async () => {
      const file = e.target.files?.[0];
      if (!file) return;

      const loadedTheme = await importThemeFromFile(file);
      if (loadedTheme) {
        setEditedTheme(loadedTheme);
        setInitialTheme(loadedTheme);
        setTheme(loadedTheme); // Apply immediately!
        console.log('Theme loaded successfully:', loadedTheme.name);
      } else {
        console.error('Failed to load theme - invalid file');
        alert('Failed to load theme. Please check that the file is a valid theme JSON file.');
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    })();
  }, [setTheme]);

  // Handle Save Theme
  const handleSaveTheme = useCallback(() => {
    const filename = `${editedTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme`;
    exportThemeToFile(editedTheme, filename);
    console.log('Theme exported:', filename);
  }, [editedTheme]);

  // Handle Reset - resets to the initial theme (before any edits)
  const handleReset = useCallback(() => {
    setEditedTheme(initialTheme);
    setTheme(initialTheme);
    console.log('Theme reset to original');
  }, [initialTheme, setTheme]);


  // Focus trap - keep focus inside drawer when open
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Focus close button when drawer opens
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key closes drawer
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Tab key for focus trap
      if (e.key === 'Tab') {
        const focusableElements = drawer.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              ...STYLES.overlay,
              zIndex: STYLES.drawer.zIndex - 1,
            }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <m.div
            ref={drawerRef}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-editor-title"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              ...STYLES.drawer,
            }}
            className="theme-editor-drawer"
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...STYLES.header,
              }}
            >
              <h2
                id="theme-editor-title"
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: STYLES.header.color,
                }}
              >
                Theme Editor
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close theme editor"
                style={{
                  ...STYLES.closeButton,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content Area - Dynamic Form */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                ...STYLES.content,
              }}
            >
              {/* Hidden file input for theme loading */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Load theme file"
              />

              {/* Dynamic accordion sections */}
              {categories.map((category) => {
                const metadata = getMetadataByCategory(category);
                const metadataEntries = Object.entries(metadata);

                // Skip empty categories
                if (metadataEntries.length === 0) return null;

                return (
                  <AccordionSection
                    key={category}
                    title={`${category} (${metadataEntries.length})`}
                    isOpen={openSections.has(category)}
                    onToggle={() => toggleSection(category)}
                  >
                    {metadataEntries.map(([, meta]) => {
                      const value = getValueByPath(editedTheme as unknown as Record<string, unknown>, meta.path);
                      return (
                        <PropertyInput
                          key={meta.path}
                          metadata={meta}
                          value={value}
                          onChange={(newValue) => handleChange(meta.path, newValue)}
                        />
                      );
                    })}
                  </AccordionSection>
                );
              })}
            </div>

            {/* Footer - Action Buttons */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                gap: '8px',
                ...STYLES.footer,
              }}
            >
              {/* Load, Save, Reset buttons */}
              <button
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  ...STYLES.secondaryButton,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={handleLoadTheme}
                aria-label="Load theme from file"
              >
                Load Theme
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  ...STYLES.secondaryButton,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={handleSaveTheme}
                aria-label="Save theme to file"
              >
                Save Theme
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  ...STYLES.secondaryButton,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={handleReset}
                aria-label="Reset to original theme"
              >
                Reset
              </button>
            </div>
          </m.div>

          {/* Responsive styles for mobile */}
          <style>
            {`
              @media (max-width: 600px) {
                .theme-editor-drawer {
                  width: 100vw !important;
                  border-left: none !important;
                }
              }
            `}
          </style>
        </>
      )}
    </AnimatePresence>
  );
}
