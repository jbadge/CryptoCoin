import React, { SyntheticEvent } from 'react'

type IconProps = {
  name: string | undefined
  symbol: string | undefined
}

export function Icon({ name, symbol }: IconProps) {
  function handleEvent(e: SyntheticEvent<HTMLImageElement, Event>) {
    e.currentTarget.src = `/cryptocurrency-icons/svg/color/generic.svg`
  }

  return (
    <img
      className="icon"
      src={`/cryptocurrency-icons/svg/color/${symbol}.svg`}
      onError={handleEvent}
      height="40px"
      width="40px"
      alt={`image of ${name} icon`}
    />
  )
}
