import React from 'react'
import { IconProps } from '../types/CoinTypes'
import genericIcon from '/cryptocurrency-icons/svg/color/generic.svg'

const Icon = ({ name, symbol }: IconProps) => {
  const [error, setError] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  const iconPath = !error
    ? `${
        import.meta.env.BASE_URL
      }cryptocurrency-icons/svg/color/${symbol!.toLowerCase()}.svg`
    : genericIcon

  function handleImageError() {
    console.warn(`Icon failed to load: ${symbol}`)
    setError(true)
  }

  function handleImageLoad() {
    setLoaded(true)
  }

  return (
    <img
      className={`icon${loaded ? ' loaded' : ''}`}
      src={iconPath}
      alt={`Image of ${name} icon`}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
      style={{
        opacity: loaded ? 1 : 0,
        visibility: loaded ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease-in-out',
      }}
    />
  )
}

export default Icon
