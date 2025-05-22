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

function getThemeStyles(theme: string): string {
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
