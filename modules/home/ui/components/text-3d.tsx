"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type React from "react"

interface LayeredTextProps {
  lines?: Array<{ top: string; bottom: string }>
  fontSize?: string
  fontSizeMd?: string
  lineHeight?: number
  lineHeightMd?: number
  className?: string
}

export function LayeredText({
  lines = [
  { top: "\u00A0",     bottom: "VOX"  },
  { top: "VOX",  bottom: "SALES"      },
  { top: "CLOSER",      bottom: "PRACTICE"   },
  { top: "PRACTICE",   bottom: "COACHING"   },
  { top: "VOICE",   bottom: "CLOSE"      },
  { top: "CLOSE",      bottom: "DEALS"      },
  { top: "DEALS",      bottom: "\u00A0"     },
],
  fontSize = "72px",
  fontSizeMd = "36px",
  lineHeight = 60,
  lineHeightMd = 35,
  className = "",
}: LayeredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline>(null)

  const calculateTranslateX = (index: number) => {
    const baseOffset = 35
    const baseOffsetMd = 20
    const centerIndex = Math.floor(lines.length / 2)
    return {
      desktop: (index - centerIndex) * baseOffset,
      mobile: (index - centerIndex) * baseOffsetMd,
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const paragraphs = container.querySelectorAll("p")

    timelineRef.current = gsap.timeline({ paused: true })

    timelineRef.current.to(paragraphs, {
      y: window.innerWidth >= 768 ? -60 : -35,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.08,
    })

    const handleMouseEnter = () => {
      timelineRef.current?.play()
    }

    const handleMouseLeave = () => {
      timelineRef.current?.reverse()
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      timelineRef.current?.kill()
    }
  }, [lines])

  return (
   <div
  ref={containerRef}
  className={`h-full w-full flex items-center justify-center font-sans font-black overflow-hidden tracking-[-2px] uppercase text-black dark:text-white antialiased cursor-pointer ${className}`}
  style={{ fontSize: "clamp(28px, 4.5vw, 72px)", "--md-font-size": fontSizeMd } as React.CSSProperties}
>
  <ul className="list-none p-0 m-0 flex flex-col items-center">
    {lines.map((line, index) => {
      const translateX = calculateTranslateX(index)
      return (
        <li
          key={index}
          className={`
            overflow-hidden relative
            ${
              index % 2 === 0
                ? "transform-[skew(60deg,-30deg)_scaleY(0.66667)]"
                : "transform-[skew(0deg,-30deg)_scaleY(1.33333)]"
            }
          `}
          style={
            {
              height: `${lineHeight}px`,
              transform: `translateX(${translateX.desktop}px) skew(${index % 2 === 0 ? "60deg, -30deg" : "0deg, -30deg"}) scaleY(${index % 2 === 0 ? "0.66667" : "1.33333"})`,
              "--md-height": `${lineHeightMd}px`,
              "--md-translateX": `${translateX.mobile}px`,
            } as React.CSSProperties
          }
        >
          <p
            className="leading-13.75 md:leading-7.5 px-3.75 align-top whitespace-nowrap m-0"
            style={
              {
                height: `${lineHeight}px`,
                lineHeight: `${lineHeight - 5}px`,
              } as React.CSSProperties
            }
          >
            {line.top}
          </p>
          <p
            className="leading-13.75 md:leading-7.5 px-3.75 align-top whitespace-nowrap m-0"
            style={
              {
                height: `${lineHeight}px`,
                lineHeight: `${lineHeight - 5}px`,
              } as React.CSSProperties
            }
          >
            {line.bottom}
          </p>
        </li>
      )
    })}
  </ul>
</div>
  )
}
