import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock utility functions for business logic testing
const resumeUtils = {
  validateJsonResume: (data: any) => {
    if (!data.basics || !data.basics.name) {
      return { valid: false, errors: ['basics.name is required'] };
    }
    return { valid: true, errors: [] };
  },
  
  extractSkills: (resumeData: any) => {
    const skills = [];
    if (resumeData.skills) {
      resumeData.skills.forEach((skill: any) => {
        if (skill.keywords) {
          skills.push(...skill.keywords);
        }
      });
    }
    return skills;
  },
  
  calculateCompleteness: (resumeData: any) => {
    let score = 0;
    const sections = ['basics', 'work', 'education', 'skills'];
    
    sections.forEach(section => {
      if (resumeData[section]) {
        score += 25;
      }
    });
    
    return Math.min(score, 100);
  },
  
  generateResumePreview: (resumeData: any, theme: string) => {
    return {
      html: `<div class="${theme}-theme">${resumeData.basics?.name || 'Unnamed'}</div>`,
      css: `.${theme}-theme { font-family: Arial; }`,
      theme
    };
  }
};

const jobUtils = {
  parseJobDescription: (description: string) => {
    const skills = [];
    const requirements = [];
    
    // Extract skills from common patterns
    const skillPatterns = [
      /(?:experience with|knowledge of|proficient in)\s+([A-Za-z\s,]+)/gi,
      /(?:react|javascript|typescript|python|java|node\.js)/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        skills.push(...matches);
      }
    });
    
    // Extract years of experience
    const yearMatch = description.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
    const experienceYears = yearMatch ? `${yearMatch[1]}+ years` : null;
    
    return {
      skills: [...new Set(skills)],
      requirements,
      experienceYears,
      location: null,
      employmentType: null
    };
  },
  
  calculateJobMatch: (resumeSkills: string[], jobSkills: string[]) => {
    if (!resumeSkills.length || !jobSkills.length) {
      return 0;
    }
    
    const matchingSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    return Math.round((matchingSkills.length / jobSkills.length) * 100);
  },
  
  prioritizeJobs: (jobs: any[], userPreferences: any) => {
    return jobs.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Prefer remote work if specified
      if (userPreferences.remote && a.location?.toLowerCase().includes('remote')) {
        scoreA += 10;
      }
      if (userPreferences.remote && b.location?.toLowerCase().includes('remote')) {
        scoreB += 10;
      }
      
      // Prefer higher salaries
      if (a.salaryMax && b.salaryMax) {
        scoreA += a.salaryMax / 1000;
        scoreB += b.salaryMax / 1000;
      }
      
      return scoreB - scoreA;
    });
  }
};

const coverLetterUtils = {
  generatePersonalizedIntro: (resumeData: any, jobData: any) => {
    const name = resumeData.basics?.name || 'Applicant';
    const company = jobData.company || 'your company';
    const position = jobData.title || 'this position';
    
    return `Dear Hiring Manager,\n\nI am ${name}, and I am excited to apply for the ${position} role at ${company}.`;
  },
  
  extractRelevantExperience: (resumeData: any, jobSkills: string[]) => {
    const relevantWork = [];
    
    if (resumeData.work) {
      resumeData.work.forEach((job: any) => {
        const jobText = `${job.position} ${job.summary || ''}`.toLowerCase();
        const relevantSkills = jobSkills.filter(skill => 
          jobText.includes(skill.toLowerCase())
        );
        
        if (relevantSkills.length > 0) {
          relevantWork.push({
            ...job,
            relevantSkills
          });
        }
      });
    }
    
    return relevantWork;
  },
  
  formatCoverLetter: (sections: any, tone: string) => {
    const { intro, body, conclusion } = sections;
    
    let content = intro + '\n\n';
    
    if (tone === 'professional') {
      content += body + '\n\n';
      content += 'Thank you for your consideration. I look forward to hearing from you.\n\n';
      content += 'Sincerely,';
    } else if (tone === 'casual') {
      content += body + '\n\n';
      content += 'Thanks for reading! Hope to hear from you soon.\n\n';
      content += 'Best regards,';
    }
    
    content += conclusion;
    
    return content;
  }
};

const applicationUtils = {
  generateApplicationPackage: (resume: any, coverLetter: any, jobPosting: any) => {
    return {
      files: [
        {
          name: `${resume.name.replace(/\s+/g, '_')}.pdf`,
          type: 'application/pdf',
          content: 'resume-pdf-content'
        },
        {
          name: 'cover_letter.pdf',
          type: 'application/pdf',
          content: 'cover-letter-pdf-content'
        }
      ],
      metadata: {
        applicantName: resume.jsonData?.basics?.name,
        position: jobPosting.title,
        company: jobPosting.company,
        applicationDate: new Date().toISOString()
      }
    };
  },
  
  trackApplicationStatus: (applicationId: number, status: string) => {
    const validStatuses = ['draft', 'submitted', 'reviewed', 'interview', 'rejected', 'accepted'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    return {
      id: applicationId,
      status,
      updatedAt: new Date(),
      timeline: [
        { status: 'draft', date: new Date() },
        { status, date: new Date() }
      ]
    };
  }
};

describe('Business Logic Tests', () => {
  describe('Resume Utilities', () => {
    it('should validate JSON resume structure', () => {
      const validResume = {
        basics: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        work: [],
        education: []
      };
      
      const result = resumeUtils.validateJsonResume(validResume);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid resume structure', () => {
      const invalidResume = {
        basics: {}
      };
      
      const result = resumeUtils.validateJsonResume(invalidResume);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('basics.name is required');
    });

    it('should extract skills from resume data', () => {
      const resumeData = {
        skills: [
          {
            name: 'Programming Languages',
            keywords: ['JavaScript', 'TypeScript', 'Python']
          },
          {
            name: 'Frameworks',
            keywords: ['React', 'Node.js', 'Express']
          }
        ]
      };
      
      const skills = resumeUtils.extractSkills(resumeData);
      expect(skills).toContain('JavaScript');
      expect(skills).toContain('React');
      expect(skills).toHaveLength(6);
    });

    it('should calculate resume completeness score', () => {
      const completeResume = {
        basics: { name: 'John' },
        work: [{}],
        education: [{}],
        skills: [{}]
      };
      
      const incompleteResume = {
        basics: { name: 'John' },
        work: [{}]
      };
      
      expect(resumeUtils.calculateCompleteness(completeResume)).toBe(100);
      expect(resumeUtils.calculateCompleteness(incompleteResume)).toBe(50);
    });

    it('should generate resume preview with theme', () => {
      const resumeData = {
        basics: { name: 'Jane Smith' }
      };
      
      const preview = resumeUtils.generateResumePreview(resumeData, 'modern');
      expect(preview.html).toContain('Jane Smith');
      expect(preview.html).toContain('modern-theme');
      expect(preview.theme).toBe('modern');
    });
  });

  describe('Job Utilities', () => {
    it('should parse job description for skills and requirements', () => {
      const description = `
        We are looking for a developer with 3+ years of experience in React and TypeScript.
        Knowledge of Node.js and proficient in JavaScript is required.
      `;
      
      const parsed = jobUtils.parseJobDescription(description);
      expect(parsed.experienceYears).toBe('3+ years');
      expect(parsed.skills.length).toBeGreaterThan(0);
    });

    it('should calculate job match percentage', () => {
      const resumeSkills = ['JavaScript', 'React', 'Node.js', 'Python'];
      const jobSkills = ['JavaScript', 'React', 'TypeScript'];
      
      const matchScore = jobUtils.calculateJobMatch(resumeSkills, jobSkills);
      expect(matchScore).toBeGreaterThan(50);
      expect(matchScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty skill arrays', () => {
      expect(jobUtils.calculateJobMatch([], ['JavaScript'])).toBe(0);
      expect(jobUtils.calculateJobMatch(['JavaScript'], [])).toBe(0);
      expect(jobUtils.calculateJobMatch([], [])).toBe(0);
    });

    it('should prioritize jobs based on user preferences', () => {
      const jobs = [
        { id: 1, location: 'New York', salaryMax: 100000 },
        { id: 2, location: 'Remote', salaryMax: 120000 },
        { id: 3, location: 'San Francisco', salaryMax: 150000 }
      ];
      
      const preferences = { remote: true };
      const prioritized = jobUtils.prioritizeJobs([...jobs], preferences);
      
      // Remote job should be prioritized
      expect(prioritized[0].location).toBe('Remote');
    });
  });

  describe('Cover Letter Utilities', () => {
    it('should generate personalized introduction', () => {
      const resumeData = {
        basics: { name: 'Alice Johnson' }
      };
      const jobData = {
        title: 'Software Engineer',
        company: 'Tech Innovations'
      };
      
      const intro = coverLetterUtils.generatePersonalizedIntro(resumeData, jobData);
      expect(intro).toContain('Alice Johnson');
      expect(intro).toContain('Software Engineer');
      expect(intro).toContain('Tech Innovations');
    });

    it('should extract relevant work experience', () => {
      const resumeData = {
        work: [
          {
            position: 'Frontend Developer',
            summary: 'Worked with React and JavaScript'
          },
          {
            position: 'Backend Developer',
            summary: 'Developed APIs with Python'
          }
        ]
      };
      
      const jobSkills = ['React', 'JavaScript'];
      const relevantWork = coverLetterUtils.extractRelevantExperience(resumeData, jobSkills);
      
      expect(relevantWork).toHaveLength(1);
      expect(relevantWork[0].position).toBe('Frontend Developer');
      expect(relevantWork[0].relevantSkills).toContain('React');
    });

    it('should format cover letter with different tones', () => {
      const sections = {
        intro: 'Dear Hiring Manager,',
        body: 'I am excited about this opportunity.',
        conclusion: 'John Doe'
      };
      
      const professionalLetter = coverLetterUtils.formatCoverLetter(sections, 'professional');
      const casualLetter = coverLetterUtils.formatCoverLetter(sections, 'casual');
      
      expect(professionalLetter).toContain('Sincerely,');
      expect(casualLetter).toContain('Best regards,');
      expect(professionalLetter).toContain('Thank you for your consideration');
      expect(casualLetter).toContain('Hope to hear from you soon');
    });
  });

  describe('Application Utilities', () => {
    it('should generate complete application package', () => {
      const resume = {
        name: 'My Resume',
        jsonData: {
          basics: { name: 'Test User' }
        }
      };
      const coverLetter = { content: 'Cover letter content' };
      const jobPosting = {
        title: 'Developer',
        company: 'Test Company'
      };
      
      const applicationPackage = applicationUtils.generateApplicationPackage(
        resume, coverLetter, jobPosting
      );
      
      expect(applicationPackage.files).toHaveLength(2);
      expect(applicationPackage.files[0].name).toBe('My_Resume.pdf');
      expect(applicationPackage.metadata.applicantName).toBe('Test User');
      expect(applicationPackage.metadata.position).toBe('Developer');
    });

    it('should track application status changes', () => {
      const tracked = applicationUtils.trackApplicationStatus(1, 'submitted');
      
      expect(tracked.id).toBe(1);
      expect(tracked.status).toBe('submitted');
      expect(tracked.timeline).toHaveLength(2);
      expect(tracked.updatedAt).toBeInstanceOf(Date);
    });

    it('should reject invalid application statuses', () => {
      expect(() => {
        applicationUtils.trackApplicationStatus(1, 'invalid-status');
      }).toThrow('Invalid status: invalid-status');
    });
  });

  describe('Data Processing Edge Cases', () => {
    it('should handle malformed resume data', () => {
      const malformedData = {
        basics: null,
        work: 'not-an-array',
        skills: undefined
      };
      
      const skills = resumeUtils.extractSkills(malformedData);
      expect(skills).toEqual([]);
      
      const completeness = resumeUtils.calculateCompleteness(malformedData);
      expect(completeness).toBe(0);
    });

    it('should handle empty job descriptions', () => {
      const parsed = jobUtils.parseJobDescription('');
      expect(parsed.skills).toEqual([]);
      expect(parsed.experienceYears).toBeNull();
    });

    it('should handle missing resume or job data in cover letter generation', () => {
      const intro = coverLetterUtils.generatePersonalizedIntro({}, {});
      expect(intro).toContain('Applicant');
      expect(intro).toContain('your company');
      expect(intro).toContain('this position');
    });
  });

  describe('Performance and Optimization', () => {
    it('should efficiently process large resume datasets', () => {
      const largeResumeData = {
        skills: Array(100).fill(null).map((_, i) => ({
          name: `Skill Category ${i}`,
          keywords: [`skill${i}a`, `skill${i}b`, `skill${i}c`]
        }))
      };
      
      const startTime = Date.now();
      const skills = resumeUtils.extractSkills(largeResumeData);
      const endTime = Date.now();
      
      expect(skills).toHaveLength(300);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle job matching with large skill sets', () => {
      const largeResumeSkills = Array(200).fill(null).map((_, i) => `skill${i}`);
      const largeJobSkills = Array(50).fill(null).map((_, i) => `skill${i * 2}`);
      
      const startTime = Date.now();
      const matchScore = jobUtils.calculateJobMatch(largeResumeSkills, largeJobSkills);
      const endTime = Date.now();
      
      expect(typeof matchScore).toBe('number');
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should sanitize user input in job descriptions', () => {
      const maliciousDescription = `
        <script>alert('xss')</script>
        Looking for a developer with React experience.
        <img src="x" onerror="alert('xss')">
      `;
      
      const parsed = jobUtils.parseJobDescription(maliciousDescription);
      expect(parsed.skills.join('')).not.toContain('<script>');
      expect(parsed.skills.join('')).not.toContain('onerror');
    });

    it('should validate email formats in resume basics', () => {
      const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
      
      expect(validateEmail('valid@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle special characters in names and titles', () => {
      const resumeData = {
        basics: { name: "José María O'Connor-Smith Jr." }
      };
      const jobData = {
        title: "Senior Software Engineer (React/Node.js)",
        company: "Tech & Innovation Co."
      };
      
      const intro = coverLetterUtils.generatePersonalizedIntro(resumeData, jobData);
      expect(intro).toContain("José María O'Connor-Smith Jr.");
      expect(intro).toContain("Senior Software Engineer (React/Node.js)");
      expect(intro).toContain("Tech & Innovation Co.");
    });
  });
});