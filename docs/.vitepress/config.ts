import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "JobBlaster",
  description:
    "An Open-Source Resume/CV builder with AI assisted job matching, scoring and custom resume+cover letter creations.",
  base: "/",
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "GitHub", link: "https://github.com/eooo-io/jobblaster" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Introduction", link: "/guide/" },
          { text: "Quick Start", link: "/guide/quick-start" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Docker Setup", link: "/guide/docker-setup" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Resume Builder", link: "/features/resume-builder" },
          { text: "Cover Letters", link: "/features/cover-letters" },
          { text: "Job Matching", link: "/features/job-matching" },
          { text: "AI Integration", link: "/features/ai-integration" },
          { text: "Templates", link: "/features/templates" },
        ],
      },
      {
        text: "User Guide",
        items: [
          { text: "User Interface", link: "/user-guide/interface" },
          { text: "Creating Resumes", link: "/user-guide/creating-resumes" },
          { text: "Managing Applications", link: "/user-guide/managing-applications" },
          { text: "Job Search", link: "/user-guide/job-search" },
          { text: "Settings", link: "/user-guide/settings" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "Overview", link: "/api/" },
          { text: "Authentication", link: "/api/authentication" },
          { text: "Resume Endpoints", link: "/api/resume-endpoints" },
          { text: "Job Endpoints", link: "/api/job-endpoints" },
          { text: "AI Endpoints", link: "/api/ai-endpoints" },
        ],
      },
      {
        text: "Development",
        items: [
          { text: "Architecture", link: "/development/architecture" },
          { text: "Contributing", link: "/development/contributing" },
          { text: "Code Style", link: "/development/code-style" },
          { text: "Testing", link: "/development/testing" },
          { text: "Deployment", link: "/development/deployment" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/eooo-io/jobblaster" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present JobBlaster",
    },
  },
});
