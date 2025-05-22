import { useToast } from "@/hooks/use-toast";
import type { JSONResumeSchema } from "./types";

export async function generatePDF(resumeData: JSONResumeSchema, theme: string = "modern") {
  try {
    // In a real implementation, this would use a library like jsPDF or Puppeteer
    // For now, we'll create a simple HTML representation and trigger print
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    const html = generateResumeHTML(resumeData, theme);
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}

function generateResumeHTML(resumeData: JSONResumeSchema, theme: string): string {
  const basics = resumeData.basics || {};
  const work = resumeData.work || [];
  const education = resumeData.education || [];
  const skills = resumeData.skills || [];

  const themeStyles = getThemeStyles(theme);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${basics.name || 'Resume'}</title>
      <style>
        ${themeStyles}
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="resume">
        <header class="header">
          <h1 class="name">${basics.name || 'Your Name'}</h1>
          <p class="title">${basics.label || basics.summary || 'Professional Title'}</p>
          <div class="contact">
            ${basics.email ? `<span>${basics.email}</span>` : ''}
            ${basics.phone ? `<span>${basics.phone}</span>` : ''}
            ${basics.location?.city ? `<span>${basics.location.city}${basics.location.region ? `, ${basics.location.region}` : ''}</span>` : ''}
          </div>
        </header>

        ${work.length > 0 ? `
        <section class="section">
          <h2 class="section-title">Experience</h2>
          ${work.map(job => `
            <div class="item">
              <h3 class="item-title">${job.position || 'Position'}</h3>
              <p class="item-subtitle">${job.name || job.company || 'Company'} • ${formatDate(job.startDate)}${job.endDate ? ` - ${formatDate(job.endDate)}` : ' - Present'}</p>
              ${job.highlights ? `
                <ul class="highlights">
                  ${job.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${education.length > 0 ? `
        <section class="section">
          <h2 class="section-title">Education</h2>
          ${education.map(edu => `
            <div class="item">
              <h3 class="item-title">${edu.studyType || 'Degree'}${edu.area ? ` in ${edu.area}` : ''}</h3>
              <p class="item-subtitle">${edu.institution || 'Institution'}${edu.endDate ? ` • ${formatDate(edu.endDate)}` : ''}</p>
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${skills.length > 0 ? `
        <section class="section">
          <h2 class="section-title">Skills</h2>
          <div class="skills">
            ${skills.map(skill => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              const keywords = typeof skill === 'object' && skill.keywords ? skill.keywords : [];
              return `
                <div class="skill-group">
                  <strong>${skillName}</strong>
                  ${keywords.length > 0 ? `<span class="keywords">${keywords.join(', ')}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.getFullYear().toString();
}

function getSkillPercentage(level: string): number {
  const levelMap: { [key: string]: number } = {
    'beginner': 30,
    'intermediate': 60,
    'advanced': 80,
    'expert': 95,
    'master': 100
  };
  return levelMap[level.toLowerCase()] || 80;
}

function getFluencyPercentage(fluency: string): number {
  const fluencyMap: { [key: string]: number } = {
    'elementary': 40,
    'limited': 50,
    'professional': 80,
    'full professional': 90,
    'native': 100,
    'bilingual': 100
  };
  return fluencyMap[fluency.toLowerCase()] || 80;
}

function getThemeStyles(theme: string): string {
  if (theme === "james-clark") {
    return `
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.4;
        color: #333;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
      }
      .resume {
        max-width: 8.5in;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%);
        color: white;
        padding: 2em;
        position: relative;
        display: flex;
        align-items: center;
        gap: 2em;
      }
      .profile-section {
        display: flex;
        align-items: center;
        gap: 2em;
        flex: 1;
      }
      .profile-photo {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: bold;
        flex-shrink: 0;
      }
      .name {
        font-size: 3em;
        font-weight: bold;
        margin: 0 0 0.2em 0;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      .title {
        font-size: 1.2em;
        margin: 0;
        opacity: 0.9;
      }
      .contact-info {
        position: absolute;
        top: 2em;
        right: 2em;
        text-align: right;
        font-size: 0.9em;
      }
      .contact-info div {
        margin-bottom: 0.5em;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5em;
      }
      .main-content {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0;
        min-height: 600px;
      }
      .sidebar {
        background: #f8f9ff;
        padding: 2em 1.5em;
        border-right: 1px solid #e5e7eb;
      }
      .content {
        padding: 2em;
      }
      .section {
        margin-bottom: 2em;
      }
      .section-title {
        display: flex;
        align-items: center;
        gap: 0.5em;
        margin-bottom: 1em;
        font-size: 1.1em;
        font-weight: bold;
        color: #1f2937;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .section-icon {
        width: 20px;
        height: 20px;
        background: #6366F1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
      .skill-item {
        margin-bottom: 1em;
      }
      .skill-name {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.3em;
        font-size: 0.9em;
        font-weight: 500;
      }
      .skill-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
      }
      .skill-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366F1, #7C3AED);
        border-radius: 4px;
      }
      .language-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1em;
        margin-top: 1em;
      }
      .language-item {
        text-align: center;
      }
      .language-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #6366F1;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin: 0 auto 0.5em auto;
        font-size: 1.2em;
      }
      .language-name {
        font-size: 0.8em;
        font-weight: 500;
      }
      .interests-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5em;
        margin-top: 1em;
      }
      .interest-item {
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: 0.9em;
      }
      .interest-icon {
        color: #6366F1;
        font-weight: bold;
      }
      .work-item {
        margin-bottom: 1.5em;
        padding-bottom: 1em;
        border-bottom: 1px solid #e5e7eb;
      }
      .work-item:last-child {
        border-bottom: none;
      }
      .work-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5em;
      }
      .item-title {
        font-weight: bold;
        color: #1f2937;
        font-size: 1.1em;
        margin: 0;
      }
      .item-subtitle {
        color: #6366F1;
        font-weight: 500;
        margin: 0.2em 0;
      }
      .item-date {
        color: #6b7280;
        font-size: 0.9em;
        text-align: right;
        white-space: nowrap;
      }
      .highlights {
        margin: 0.5em 0 0 1.2em;
        padding: 0;
      }
      .highlights li {
        margin-bottom: 0.3em;
        font-size: 0.95em;
      }
      .achievements-list {
        list-style: none;
        padding: 0;
        margin: 1em 0;
      }
      .achievements-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.5em;
        margin-bottom: 0.8em;
        font-size: 0.9em;
      }
      .achievement-icon {
        color: #6366F1;
        font-weight: bold;
        margin-top: 0.1em;
        flex-shrink: 0;
      }
      @media print {
        body { margin: 0; background: white; }
        .resume { box-shadow: none; }
      }
    `;
  }
  
  const baseStyles = `
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.4;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
      font-size: 11pt;
    }
    .resume {
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 1.5em;
      padding-bottom: 1em;
    }
    .name {
      font-size: 24pt;
      font-weight: bold;
      margin: 0 0 0.25em 0;
    }
    .title {
      font-size: 12pt;
      color: #666;
      margin: 0 0 0.5em 0;
    }
    .contact {
      font-size: 10pt;
      color: #666;
    }
    .contact span {
      margin: 0 0.5em;
    }
    .section {
      margin-bottom: 1.5em;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 0 0 0.5em 0;
      padding-bottom: 0.25em;
    }
    .item {
      margin-bottom: 1em;
    }
    .item-title {
      font-size: 12pt;
      font-weight: bold;
      margin: 0 0 0.25em 0;
    }
    .item-subtitle {
      font-size: 10pt;
      color: #666;
      margin: 0 0 0.25em 0;
    }
    .highlights {
      margin: 0.25em 0 0 1.5em;
      padding: 0;
    }
    .highlights li {
      margin-bottom: 0.25em;
      font-size: 10pt;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 1em;
    }
    .skill-group {
      flex: 1;
      min-width: 200px;
    }
    .keywords {
      display: block;
      font-size: 10pt;
      color: #666;
      margin-top: 0.25em;
    }
  `;

  const themeSpecificStyles = {
    modern: `
      .header {
        border-bottom: 2px solid #3B82F6;
      }
      .name {
        color: #3B82F6;
      }
      .section-title {
        color: #3B82F6;
        border-bottom: 1px solid #3B82F6;
      }
    `,
    classic: `
      .header {
        border-bottom: 2px solid #000;
      }
      .section-title {
        text-transform: uppercase;
        border-bottom: 1px solid #000;
      }
    `,
    creative: `
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1em;
        margin: -0.5in -0.5in 1.5em -0.5in;
      }
      .name {
        color: white;
      }
      .title, .contact {
        color: rgba(255,255,255,0.9);
      }
      .section-title {
        color: #667eea;
        border-bottom: 2px solid #667eea;
      }
    `,
    formal: `
      .header {
        border-bottom: 3px double #000;
      }
      .section-title {
        font-variant: small-caps;
        border-bottom: 1px solid #000;
      }
      body {
        font-family: 'Times New Roman', serif;
      }
    `
  };

  return baseStyles + (themeSpecificStyles[theme as keyof typeof themeSpecificStyles] || themeSpecificStyles.modern);
}
