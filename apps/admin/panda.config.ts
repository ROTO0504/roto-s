import { defineConfig, defineRecipe } from "@pandacss/dev"

const button = defineRecipe({
  className: "button",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontSize: "sm",
    fontWeight: 500,
    borderRadius: "md",
    cursor: "pointer",
    transition:
      "background-color {durations.fast} {easings.standard}, color {durations.fast} {easings.standard}, border-color {durations.fast} {easings.standard}, transform {durations.fast} {easings.standard}",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
    userSelect: "none",
    _disabled: { opacity: 0.5, cursor: "not-allowed" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "accent.default",
      outlineOffset: "2px",
    },
    _active: { transform: "translateY(1px)" },
  },
  variants: {
    variant: {
      solid: {
        bg: "accent.default",
        color: "white",
        boxShadow: "glow",
        _hover: { bg: "accent.hover" },
      },
      subtle: {
        bg: "accent.subtle",
        color: "accent.default",
        _hover: { bg: "accent.subtleHover" },
      },
      ghost: {
        bg: "transparent",
        color: "fg.muted",
        _hover: { bg: "bg.subtle", color: "fg.default" },
      },
      outline: {
        bg: "transparent",
        color: "fg.default",
        borderColor: "border.strong",
        _hover: { bg: "bg.subtle", borderColor: "border.stronger" },
      },
      danger: {
        bg: "transparent",
        color: "danger.default",
        borderColor: "danger.border",
        _hover: { bg: "danger.subtle" },
      },
    },
    size: {
      xs: { h: "7", px: "2.5", fontSize: "xs", borderRadius: "sm" },
      sm: { h: "8", px: "3" },
      md: { h: "10", px: "4" },
    },
    isFullWidth: {
      true: { width: "100%" },
    },
  },
  defaultVariants: { variant: "solid", size: "md" },
})

const iconButton = defineRecipe({
  className: "iconButton",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "full",
    cursor: "pointer",
    color: "fg.muted",
    bg: "transparent",
    border: "1px solid transparent",
    transition: "background-color {durations.fast} {easings.standard}, color {durations.fast} {easings.standard}",
    _hover: { bg: "bg.subtle", color: "fg.default" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "accent.default",
      outlineOffset: "2px",
    },
  },
  variants: {
    size: {
      sm: { w: "8", h: "8" },
      md: { w: "10", h: "10" },
    },
  },
  defaultVariants: { size: "sm" },
})

const input = defineRecipe({
  className: "input",
  base: {
    width: "100%",
    h: "10",
    px: "3",
    bg: "bg.subtle",
    color: "fg.default",
    border: "1px solid",
    borderColor: "border.default",
    borderRadius: "md",
    fontSize: "sm",
    transition:
      "border-color {durations.fast} {easings.standard}, background-color {durations.fast} {easings.standard}",
    _hover: { borderColor: "border.strong" },
    _focus: {
      outline: "none",
      borderColor: "accent.default",
      bg: "bg.surface",
      boxShadow: "0 0 0 3px {colors.accent.subtle}",
    },
    _placeholder: { color: "fg.subtle" },
  },
})

const card = defineRecipe({
  className: "card",
  base: {
    border: "1px solid",
    borderColor: "border.default",
    borderRadius: "lg",
  },
  variants: {
    variant: {
      surface: { bg: "bg.surface" },
      raised: { bg: "bg.surfaceRaised", boxShadow: "md" },
      flat: { bg: "transparent" },
    },
    size: {
      sm: { p: "4" },
      md: { p: "5" },
      lg: { p: "6" },
    },
  },
  defaultVariants: { variant: "surface", size: "lg" },
})

const badge = defineRecipe({
  className: "badge",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1",
    px: "2",
    h: "5.5",
    py: "0.5",
    borderRadius: "sm",
    fontSize: "xs",
    fontWeight: 500,
    fontFamily: "mono",
    border: "1px solid",
    lineHeight: "1.4",
  },
  variants: {
    tone: {
      neutral: { bg: "bg.subtle", color: "fg.muted", borderColor: "border.default" },
      accent: { bg: "accent.subtle", color: "accent.default", borderColor: "accent.border" },
      danger: { bg: "danger.subtle", color: "danger.default", borderColor: "danger.border" },
      muted: { bg: "transparent", color: "fg.subtle", borderColor: "border.default" },
    },
  },
  defaultVariants: { tone: "neutral" },
})

const field = defineRecipe({
  className: "field",
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5",
  },
})

export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  include: ["./src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  conditions: {
    light: "[data-theme=light] &",
  },
  theme: {
    extend: {
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      tokens: {
        colors: {
          gray: {
            50: { value: "#fafafa" },
            100: { value: "#f4f4f5" },
            200: { value: "#e4e4e7" },
            300: { value: "#d4d4d8" },
            400: { value: "#a1a1aa" },
            500: { value: "#71717a" },
            600: { value: "#52525b" },
            700: { value: "#3f3f46" },
            800: { value: "#27272a" },
            850: { value: "#1f1f23" },
            900: { value: "#18181b" },
            925: { value: "#111114" },
            950: { value: "#0a0a0b" },
          },
          accent: {
            300: { value: "#a5b4fc" },
            400: { value: "#818cf8" },
            500: { value: "#6366f1" },
            600: { value: "#4f46e5" },
            700: { value: "#4338ca" },
          },
          red: {
            300: { value: "#fca5a5" },
            400: { value: "#f87171" },
            500: { value: "#ef4444" },
            900: { value: "#7f1d1d" },
            950: { value: "#450a0a" },
          },
          green: {
            400: { value: "#4ade80" },
            500: { value: "#22c55e" },
          },
        },
        fonts: {
          sans: { value: '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, sans-serif' },
          mono: {
            value: '"JetBrains Mono", "SF Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          },
        },
        shadows: {
          sm: { value: "0 1px 2px rgba(0, 0, 0, 0.4)" },
          md: { value: "0 4px 12px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.3)" },
          lg: { value: "0 12px 32px rgba(0, 0, 0, 0.45), 0 4px 8px rgba(0, 0, 0, 0.3)" },
          glow: { value: "0 0 0 1px rgba(99, 102, 241, 0.2), 0 6px 24px -8px rgba(99, 102, 241, 0.55)" },
        },
        durations: {
          fast: { value: "120ms" },
          base: { value: "200ms" },
          slow: { value: "320ms" },
        },
        easings: {
          standard: { value: "cubic-bezier(0.2, 0, 0, 1)" },
          emphasized: { value: "cubic-bezier(0.3, 0, 0, 1.1)" },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            canvas: { value: { base: "{colors.gray.950}", _light: "#ffffff" } },
            surface: { value: { base: "{colors.gray.900}", _light: "{colors.gray.50}" } },
            surfaceRaised: { value: { base: "{colors.gray.850}", _light: "#ffffff" } },
            subtle: { value: { base: "{colors.gray.925}", _light: "{colors.gray.100}" } },
          },
          fg: {
            default: { value: { base: "{colors.gray.100}", _light: "{colors.gray.900}" } },
            muted: { value: { base: "{colors.gray.400}", _light: "{colors.gray.600}" } },
            subtle: { value: { base: "{colors.gray.500}", _light: "{colors.gray.500}" } },
          },
          border: {
            subtle: { value: { base: "{colors.gray.900}", _light: "{colors.gray.100}" } },
            default: { value: { base: "{colors.gray.800}", _light: "{colors.gray.200}" } },
            strong: { value: { base: "{colors.gray.700}", _light: "{colors.gray.300}" } },
            stronger: { value: { base: "{colors.gray.600}", _light: "{colors.gray.400}" } },
          },
          accent: {
            default: { value: { base: "{colors.accent.500}", _light: "{colors.accent.600}" } },
            hover: { value: { base: "{colors.accent.600}", _light: "{colors.accent.700}" } },
            subtle: { value: "rgba(99, 102, 241, 0.12)" },
            subtleHover: { value: "rgba(99, 102, 241, 0.2)" },
            border: { value: "rgba(99, 102, 241, 0.35)" },
          },
          danger: {
            default: { value: { base: "{colors.red.400}", _light: "{colors.red.500}" } },
            subtle: { value: "rgba(248, 113, 113, 0.1)" },
            border: { value: { base: "{colors.red.900}", _light: "{colors.red.300}" } },
          },
          success: {
            default: { value: { base: "{colors.green.400}", _light: "{colors.green.500}" } },
          },
        },
      },
      recipes: { button, iconButton, input, card, badge, field },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg.canvas",
      color: "fg.default",
      fontFamily: "sans",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    body: {
      margin: 0,
      minH: "100vh",
      backgroundImage: {
        base: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent 60%)",
        _light: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.06), transparent 60%)",
      },
      backgroundAttachment: "fixed",
    },
    a: {
      color: "accent.default",
      textDecoration: "none",
      transition: "color {durations.fast} {easings.standard}",
      _hover: { color: "accent.400" },
    },
    "*": {
      "&::-webkit-scrollbar": { width: "10px", height: "10px" },
      "&::-webkit-scrollbar-track": { bg: "transparent" },
      "&::-webkit-scrollbar-thumb": {
        bg: { base: "gray.800", _light: "gray.300" },
        borderRadius: "full",
        border: "2px solid",
        borderColor: "bg.canvas",
      },
      "&::-webkit-scrollbar-thumb:hover": { bg: { base: "gray.700", _light: "gray.400" } },
    },
    ":focus-visible": {
      outline: "2px solid",
      outlineColor: "accent.default",
      outlineOffset: "2px",
    },
    "::selection": {
      bg: "accent.subtle",
      color: "fg.default",
    },
  },
})
