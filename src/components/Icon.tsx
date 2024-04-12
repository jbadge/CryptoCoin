import React from 'react'
import { IconProps } from '../types/CoinTypes'

const Icon = ({ name, symbol }: IconProps) => {
  function handleEvent(e: React.SyntheticEvent<HTMLImageElement, Event>) {
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

export default Icon
