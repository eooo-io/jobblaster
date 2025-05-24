import { pool } from "./db";
import type { Resume, InsertResume } from "@shared/schema";

export class ResumeService {
  // Create a new resume
  async create(resumeData: InsertResume): Promise<Resume> {
    const query = `
      INSERT INTO resumes (name, user_id, json_data, theme, is_default)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, user_id, json_data, theme, is_default, created_at
    `;
    
    const values = [
      resumeData.name,
      resumeData.userId,
      JSON.stringify(resumeData.jsonData),
      resumeData.theme || 'default',
      resumeData.isDefault || false
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id,
      jsonData: row.json_data,
      theme: row.theme,
      isDefault: row.is_default,
      createdAt: row.created_at
    };
  }

  // Get all resumes for a user
  async getByUserId(userId: number): Promise<Resume[]> {
    const query = `
      SELECT id, name, user_id, json_data, theme, is_default, created_at
      FROM resumes
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      userId: row.user_id,
      jsonData: row.json_data,
      theme: row.theme,
      isDefault: row.is_default,
      createdAt: row.created_at
    }));
  }

  // Get a single resume by ID
  async getById(id: number): Promise<Resume | null> {
    const query = `
      SELECT id, name, user_id, json_data, theme, is_default, created_at
      FROM resumes
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id,
      jsonData: row.json_data,
      theme: row.theme,
      isDefault: row.is_default,
      createdAt: row.created_at
    };
  }

  // Update a resume
  async update(id: number, userId: number, updateData: Partial<InsertResume>): Promise<Resume | null> {
    // First check if resume exists and belongs to user
    const existingResume = await this.getById(id);
    if (!existingResume || existingResume.userId !== userId) {
      return null;
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updateData.name);
    }
    
    if (updateData.jsonData !== undefined) {
      fields.push(`json_data = $${paramIndex++}`);
      values.push(JSON.stringify(updateData.jsonData));
    }
    
    if (updateData.theme !== undefined) {
      fields.push(`theme = $${paramIndex++}`);
      values.push(updateData.theme);
    }
    
    if (updateData.isDefault !== undefined) {
      fields.push(`is_default = $${paramIndex++}`);
      values.push(updateData.isDefault);
    }

    if (fields.length === 0) {
      return existingResume; // No updates to make
    }

    values.push(id, userId);
    
    const query = `
      UPDATE resumes
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING id, name, user_id, json_data, theme, is_default, created_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id,
      jsonData: row.json_data,
      theme: row.theme,
      isDefault: row.is_default,
      createdAt: row.created_at
    };
  }

  // Delete a resume
  async delete(id: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM resumes
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  // Get default resume for a user
  async getDefault(userId: number): Promise<Resume | null> {
    const query = `
      SELECT id, name, user_id, json_data, theme, is_default, created_at
      FROM resumes
      WHERE user_id = $1 AND is_default = true
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id,
      jsonData: row.json_data,
      theme: row.theme,
      isDefault: row.is_default,
      createdAt: row.created_at
    };
  }

  // Set a resume as default (unsets all others for the user)
  async setDefault(id: number, userId: number): Promise<Resume | null> {
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First check if resume exists and belongs to user
      const checkResult = await client.query(
        'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // Unset all default resumes for this user
      await client.query(
        'UPDATE resumes SET is_default = false WHERE user_id = $1',
        [userId]
      );
      
      // Set the specified resume as default
      const result = await client.query(
        `UPDATE resumes 
         SET is_default = true 
         WHERE id = $1 AND user_id = $2
         RETURNING id, name, user_id, json_data, theme, is_default, created_at`,
        [id, userId]
      );
      
      await client.query('COMMIT');
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        userId: row.user_id,
        jsonData: row.json_data,
        theme: row.theme,
        isDefault: row.is_default,
        createdAt: row.created_at
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}