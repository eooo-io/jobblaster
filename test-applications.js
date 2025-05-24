// Simple test to check database connectivity for applications
const { Pool } = require('pg');

async function testApplicationsQuery() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Testing applications query...');
    
    const result = await pool.query(`
      SELECT a.id, a.user_id, a.resume_id, a.job_id, a.cover_letter_id, 
             a.status, a.notes, a.applied_at, a.created_at,
             jp.title, jp.company, jp.location, jp.employment_type,
             r.name, r.filename,
             cl.content
      FROM applications a
      LEFT JOIN job_postings jp ON a.job_id = jp.id  
      LEFT JOIN resumes r ON a.resume_id = r.id
      LEFT JOIN cover_letters cl ON a.cover_letter_id = cl.id
      WHERE a.user_id = 1
    `);
    
    console.log('Query successful! Results:', result.rows);
    
    // Format the data like the application expects
    const formatted = result.rows.map(app => ({
      id: app.id,
      userId: app.user_id,
      resumeId: app.resume_id,
      jobId: app.job_id,
      coverLetterId: app.cover_letter_id,
      status: app.status,
      notes: app.notes,
      appliedAt: app.applied_at,
      createdAt: app.created_at,
      jobPosting: app.title ? {
        id: app.job_id,
        title: app.title,
        company: app.company,
        location: app.location,
        employmentType: app.employment_type
      } : undefined,
      resume: app.name ? {
        id: app.resume_id,
        name: app.name,
        filename: app.filename
      } : undefined,
      coverLetter: app.content ? {
        id: app.cover_letter_id,
        content: app.content
      } : undefined
    }));
    
    console.log('Formatted data:', JSON.stringify(formatted, null, 2));
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

testApplicationsQuery();