import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Fetch first page of scripts, you can paginate as needed
  const response = await fetch('https://scriptblox.com/api/script/fetch?page=1');
  const data = await response.json();

  // Optionally process and fetch additional details/profiles here

  res.status(200).json(data);
}
