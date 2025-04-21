// This is a simplified resume parser
// In a production app, you would use a more robust solution like resume-parser npm package
// or integrate with a service like Affinda, Sovren, etc.

export type ParsedResume = {
    basics: {
      name: string
      email: string
      phone: string
      location: string
      title: string
      summary: string
      website: string
    }
    education: Array<{
      institution: string
      area: string
      studyType: string
      startDate: string
      endDate: string
      gpa: string
    }>
    work: Array<{
      company: string
      position: string
      startDate: string
      endDate: string
      summary: string
      highlights: string[]
    }>
    skills: Array<{
      name: string
      level: string
      keywords: string[]
    }>
    projects: Array<{
      name: string
      description: string
      highlights: string[]
      url: string
    }>
    certifications: Array<{
      name: string
      issuer: string
      date: string
    }>
  }
  
  export const defaultResume: ParsedResume = {
    basics: {
      name: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      summary: "",
      website: "",
    },
    education: [],
    work: [],
    skills: [],
    projects: [],
    certifications: [],
  }
  
  export async function parseResume(file: File): Promise<ParsedResume> {
    // In a real implementation, you would send the file to a server or use a client-side library
    // For this demo, we'll simulate parsing with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is mock data - in a real app, this would be the result of actual parsing
        resolve({
          basics: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "(555) 123-4567",
            location: "San Francisco, CA",
            title: "Senior Frontend Developer",
            summary:
              "Experienced frontend developer with 5+ years of experience building modern web applications with React, TypeScript, and Next.js.",
            website: "https://johndoe.dev",
          },
          education: [
            {
              institution: "University of California, Berkeley",
              area: "Computer Science",
              studyType: "Bachelor of Science",
              startDate: "2015-09-01",
              endDate: "2019-05-31",
              gpa: "3.8",
            },
          ],
          work: [
            {
              company: "Tech Solutions Inc.",
              position: "Senior Frontend Developer",
              startDate: "2021-06-01",
              endDate: "Present",
              summary: "Lead frontend development for enterprise SaaS platform",
              highlights: [
                "Architected and implemented new React component library",
                "Reduced bundle size by 35% through code splitting and lazy loading",
                "Mentored junior developers and led code reviews",
              ],
            },
            {
              company: "WebDev Agency",
              position: "Frontend Developer",
              startDate: "2019-07-01",
              endDate: "2021-05-31",
              summary: "Developed responsive web applications for various clients",
              highlights: [
                "Built 15+ client websites using React and Next.js",
                "Implemented CI/CD pipelines for automated testing and deployment",
                "Collaborated with designers to implement pixel-perfect UIs",
              ],
            },
          ],
          skills: [
            {
              name: "Frontend Development",
              level: "Expert",
              keywords: ["React", "TypeScript", "Next.js", "CSS", "HTML"],
            },
            {
              name: "UI/UX",
              level: "Intermediate",
              keywords: ["Figma", "Responsive Design", "Accessibility"],
            },
            {
              name: "Backend Development",
              level: "Intermediate",
              keywords: ["Node.js", "Express", "MongoDB", "PostgreSQL"],
            },
          ],
          projects: [
            {
              name: "Personal Portfolio",
              description: "A showcase of my work and skills",
              highlights: ["Built with Next.js and Tailwind CSS", "Fully responsive design", "Dark mode support"],
              url: "https://johndoe.dev",
            },
            {
              name: "E-commerce Platform",
              description: "A full-stack e-commerce solution",
              highlights: [
                "React frontend with Next.js",
                "Node.js backend with Express",
                "Stripe integration for payments",
              ],
              url: "https://github.com/johndoe/ecommerce",
            },
          ],
          certifications: [
            {
              name: "AWS Certified Developer",
              issuer: "Amazon Web Services",
              date: "2022-03-15",
            },
            {
              name: "React Advanced Certification",
              issuer: "Frontend Masters",
              date: "2021-11-10",
            },
          ],
        })
      }, 1500)
    })
  }
  
  export function formatDate(dateString: string): string {
    if (dateString === "Present") return "Present"
  
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date)
    } catch (e) {
      return dateString
    }
  }
0  