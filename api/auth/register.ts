import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../_lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'suraag_super_secret_key_2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { employeeId, email, password, name, role, department, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const generatedEmployeeId = employeeId || `AGT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId: generatedEmployeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or Employee ID already registered.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        employeeId: generatedEmployeeId,
        email,
        password: hashedPassword,
        name: name || 'New Agent',
        role: role || 'Investigator',
        department,
        phone
      }
    });

    const token = jwt.sign(
      { 
        id: newUser.id, 
        role: newUser.role, 
        name: newUser.name, 
        employeeId: newUser.employeeId, 
        email: newUser.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    return res.status(200).json({ 
      token, 
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
