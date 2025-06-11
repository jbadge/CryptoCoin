import { Interval } from '../types/CoinTypes'
import { debugMode } from './config'

// Helper function currently unused
export function generateTimestamp(): string {
  let dt = new Date()
  let hour = (dt.getHours() < 10 ? '0' : '') + dt.getHours()
  let minute = (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes()
  let second = (dt.getSeconds() < 10 ? '0' : '') + dt.getSeconds()
  const timestamp = `${hour}:${minute}:${second}`
  return timestamp
}

export function calculateStartTime(interval: Interval, count: number): number {
  const currentTime = Date.now()
  switch (interval) {
    case 'm1':
      return currentTime - count * 1 * 60 * 1000
    case 'm5':
      return currentTime - count * 5 * 60 * 1000
    case 'm15':
      return currentTime - count * 15 * 60 * 1000
    case 'm30':
      return currentTime - count * 30 * 60 * 1000
    case 'h1':
      return currentTime - count * 60 * 60 * 1000
    case 'h2':
      return currentTime - count * 2 * 60 * 60 * 1000
    case 'h6':
      return currentTime - count * 6 * 60 * 60 * 1000
    case 'h12':
      return currentTime - count * 12 * 60 * 60 * 1000
    case 'd1':
      return currentTime - count * 24 * 60 * 60 * 1000
    default:
      if (debugMode) {
        console.warn(`Unknown interval: ${interval}, defaulting to m15`)
      }
      return currentTime - count * 15 * 60 * 1000
  }
}
