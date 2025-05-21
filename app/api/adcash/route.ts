import type { NextApiRequest, NextApiResponse } from 'next'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // Cache for 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check cache first
    const cachedScript = cache.get('adcashScript')
    if (cachedScript) {
      return res.status(200).send(cachedScript)
    }

    // Fetch from Adcash if not in cache
    const response = await fetch('https://adbpage.com/adblock?v=3&format=js')
    if (!response.ok) throw new Error('Failed to fetch Adcash script')
    
    const script = await response.text()
    
    // Cache the script
    cache.set('adcashScript', script)
    
    res.status(200).send(script)
  } catch (error) {
    console.error('Adcash API error:', error)
    res.status(500).json({ error: 'Failed to fetch Adcash script' })
  }
}
