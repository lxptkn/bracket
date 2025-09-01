import * as React from "react"

/** CSS breakpoint at which we consider the viewport mobile. */
const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile
 *
 * Returns true if the viewport width is below the mobile breakpoint.
 * Uses a matchMedia listener to update reactively.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
