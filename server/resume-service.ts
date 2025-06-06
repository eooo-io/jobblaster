import { pool } from "./db";
import type { Resume, InsertResume } from "@shared/schema";

export class ResumeService {
  // Create a new resume
  async create(resumeData: InsertResume): Promise<Resume> {
    const query = `
      INSERT INTO resumes (name, user_id, json_data, theme, is_default, filename)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, user_id, json_data, theme, is_default, filename, created_at
    `;
    
    const values = [
      resumeData.name,
      resumeData.userId,
      JSON.stringify(resumeData.jsonData),
      resumeData.theme || 'default',
      resumeData.isDefault || false,
      resumeData.filename || null
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
      filename: row.filename,
      createdAt: row.created_at
    };
  }

  // Get all resumes for a user
  async getByUserId(userId: number): Promise<Resume[]> {
    const query = `
      SELECT id, name, user_id, json_data, theme, is_default, filename, created_at
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
      filename: row.filename,
      createdAt: row.created_at
    }));
  }

  // Get a single resume by ID
  async getById(id: number): Promise<Resume | null> {
    const query = `
      SELECT id, name, user_id, json_data, theme, is_default, filename, created_at
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
      filename: row.filename,
      createdAt: row.created_at
    };
  }

  // Update a resume
  async update(id: number, userId: number, updateData: Partial<InsertResume>): Promise<Resume | null> {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      setClauses.push(`name = $${paramCount}`);
      values.push(updateData.name);
      paramCount++;
    }

    if (updateData.jsonData !== undefined) {
      setClauses.push(`json_data = $${paramCount}`);
      values.push(JSON.stringify(updateData.jsonData));
      paramCount++;
    }

    if (updateData.theme !== undefined) {
      setClauses.push(`theme = $${paramCount}`);
      values.push(updateData.theme);
      paramCount++;
    }

    if (updateData.isDefault !== undefined) {
      setClauses.push(`is_default = $${paramCount}`);
      values.push(updateData.isDefault);
      paramCount++;
    }

    if (updateData.filename !== undefined) {
      setClauses.push(`filename = $${paramCount}`);
      values.push(updateData.filename);
      paramCount++;
    }

    if (setClauses.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    values.push(userId);

    const query = `
      UPDATE resumes 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING id, name, user_id, json_data, theme, is_default, filename, created_at
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
      filename: row.filename,
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
    return (result.rowCount || 0) > 0;
  }

  // Get default resume for a user
  async getDefault(userId: number): Promise<Resume | null> {
    const query = `
      SELECT id, name, user_id, json_data, theme, is_default, filename, created_at
      FROM resumes
      WHERE user_id = $1 AND is_default = true
      ORDER BY created_at DESC
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
      filename: row.filename,
      createdAt: row.created_at
    };
  }

  // Set a resume as default
  async setDefault(id: number, userId: number): Promise<Resume | null> {
    // First, unset all defaults for this user
    await pool.query(
      'UPDATE resumes SET is_default = false WHERE user_id = $1',
      [userId]
    );

    // Then set the specified resume as default
    const query = `
      UPDATE resumes 
      SET is_default = true
      WHERE id = $1 AND user_id = $2
      RETURNING id, name, user_id, json_data, theme, is_default, filename, created_at
    `;

    const result = await pool.query(query, [id, userId]);

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
      filename: row.filename,
      createdAt: row.created_at
    };
  }
}