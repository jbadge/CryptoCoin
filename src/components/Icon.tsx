import React, { SyntheticEvent } from 'react'

type IconProps = {
  name: string | undefined
  symbol: string | undefined
}

export function Icon({ name, symbol }: IconProps) {
  function handleEvent(e: SyntheticEvent<HTMLImageElement, Event>) {
    e.currentTarget.src = `/node_modules/cryptocurrency-icons/svg/color/generic.svg`
  }

  return (
    <img
      className="icon"
      src={`/node_modules/cryptocurrency-icons/svg/color/${symbol}.svg`}
      onError={handleEvent}
      alt={`image of ${name} icon`}
    />
  )
}
