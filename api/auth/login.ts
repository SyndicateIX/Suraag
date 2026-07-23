import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'suraag_super_secret_key_2026';

const AGENT_CREDENTIALS = [
  { id: '1', name: 'Atharav', email: 'atharav1708@suraag.ai', password: 'ATH1708!', role: 'Investigator', employeeId: 'AGT-001' },
  { id: '2', name: 'Archita', email: 'archita1503@suraag.ai', password: 'ARC1503!', role: 'Investigator', employeeId: 'AGT-002' },
  { id: '3', name: 'Anuradha', email: 'anuradha1411@suraag.ai', password: 'ANU1411!', role: 'Investigator', employeeId: 'AGT-003' },
  { id: '4', name: 'Aditya', email: 'aditya1205@suraag.ai', password: 'ADI1205!', role: 'Investigator', employeeId: 'AGT-004' },
  { id: '5', name: 'Dipankar', email: 'dipankar2803@suraag.ai', password: 'DIP2803!', role: 'Investigator', employeeId: 'AGT-005' },
  { id: '6', name: 'Darshil', email: 'darshil1812@suraag.ai', password: 'DAR1812!', role: 'Investigator', employeeId: 'AGT-006' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = AGENT_CREDENTIALS.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        name: user.name, 
        employeeId: user.employeeId,
        email: user.email
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    return res.status(200).json({ 
      token, 
      user: {
        id: user.id,
        employeeId: user.employeeId,
        role: user.role,
        name: user.name,
        email: user.email
      } 
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
