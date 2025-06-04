import React, { useEffect } from 'react'
import { IconProps } from '../types/CoinTypes'
import genericIcon from '/cryptocurrency-icons/svg/color/generic.svg'

const Icon = ({ name, symbol }: IconProps) => {
  const iconElement = React.useRef<HTMLImageElement>(null)
  const [error, setError] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  useEffect(() => {
    const img = iconElement.current
    if (img) {
      if (img.complete && img.naturalHeight !== 0) {
        setLoaded(true)
      }
    }
  }, [symbol])

  function handleImageError() {
    setError(true)
  }

  return (
    <>
      <img
        ref={iconElement}
        className="icon"
        src={
          !error
            ? `/cryptocurrency-icons/svg/color/${symbol?.toLowerCase()}.svg`
            : genericIcon
        }
        onError={handleImageError}
        onLoad={() => setLoaded(true)}
        alt={`Image of ${name} icon`}
        style={loaded ? { display: 'inline-block' } : { display: 'none' }}
      />
    </>
  )
}

export default Icon
