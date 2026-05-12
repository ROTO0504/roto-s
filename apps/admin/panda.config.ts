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
    transition: "all 0.12s ease",
    border: "1px solid transparent",
    _disabled: { opacity: 0.5, cursor: "not-allowed" },
  },
  variants: {
    variant: {
      solid: {
        bg: "accent.500",
        color: "white",
        _hover: { bg: "accent.600" },
      },
      ghost: {
        bg: "transparent",
        color: "gray.200",
        _hover: { bg: "gray.800" },
      },
      outline: {
        bg: "transparent",
        color: "gray.100",
        borderColor: "gray.700",
        _hover: { bg: "gray.800" },
      },
      danger: {
        bg: "transparent",
        color: "red.400",
        borderColor: "red.900",
        _hover: { bg: "red.950" },
      },
    },
    size: {
      sm: { h: "8", px: "3" },
      md: { h: "10", px: "4" },
    },
  },
  defaultVariants: { variant: "solid", size: "md" },
})

const input = defineRecipe({
  className: "input",
  base: {
    width: "100%",
    h: "10",
    px: "3",
    bg: "gray.900",
    color: "gray.100",
    border: "1px solid",
    borderColor: "gray.800",
    borderRadius: "md",
    fontSize: "sm",
    transition: "border-color 0.12s",
    _focus: { outline: "none", borderColor: "accent.500" },
    _placeholder: { color: "gray.500" },
  },
})

const card = defineRecipe({
  className: "card",
  base: {
    bg: "gray.900",
    border: "1px solid",
    borderColor: "gray.800",
    borderRadius: "lg",
    p: "6",
  },
})

export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  include: ["./src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  theme: {
    extend: {
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
            900: { value: "#18181b" },
            950: { value: "#0a0a0b" },
          },
          accent: {
            400: { value: "#818cf8" },
            500: { value: "#6366f1" },
            600: { value: "#4f46e5" },
          },
          red: {
            400: { value: "#f87171" },
            900: { value: "#7f1d1d" },
            950: { value: "#450a0a" },
          },
        },
        fonts: {
          sans: { value: '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, sans-serif' },
        },
      },
      recipes: { button, input, card },
    },
  },
  globalCss: {
    "html, body": {
      bg: "gray.950",
      color: "gray.100",
      fontFamily: "sans",
      WebkitFontSmoothing: "antialiased",
    },
    body: { margin: 0 },
    a: { color: "accent.400", textDecoration: "none" },
  },
})
