import type { ReactNode } from "react"

import { badge } from "../../styled-system/recipes"

type Tone = "neutral" | "accent" | "danger" | "muted"

type Props = {
  tone?: Tone
  children: ReactNode
}

export const Badge = ({ tone = "neutral", children }: Props) => <span className={badge({ tone })}>{children}</span>
