export interface ParsedResume {
    basics: {
      name: string
      title: string
      email: string
      phone: string
      location: string
      website: string
      summary: string
    }
    work: Array<{
      company: string
      position: string
      startDate: string
      endDate: string
      summary: string
      highlights: string[]
    }>
    education: Array<{
      institution: string
      area: string
      studyType: string
      startDate: string
      endDate: string
      gpa: string
    }>
    skills: Array<{
      name: string
      level: string
      keywords: string[]
    }>
    projects: Array<{
      name: string
      description: string
      startDate: string
      endDate: string
      url: string
      highlights: string[]
    }>
  }
  
  export const defaultResume: ParsedResume = {
    basics: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
    },
    work: [],
    education: [],
    skills: [],
    projects: [],
  }
  
  export function formatDate(dateString: string): string {
    if (!dateString) return "N/A"
    if (dateString === "Present") return "Present"
  
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    } catch (e) {
      return dateString
    }
  }
  
  export async function parseResume(file: File): Promise<ParsedResume> {
    // In a real application, this would call an API to parse the resume
    // For this demo, we'll return mock data after a delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          basics: {
            name: "Alex Johnson",
            title: "Senior Frontend Developer",
            email: "alex.johnson@example.com",
            phone: "(555) 123-4567",
            location: "San Francisco, CA",
            website: "https://alexjohnson.dev",
            summary:
              "Experienced frontend developer with 5+ years of experience building responsive and accessible web applications using React, TypeScript, and modern web technologies.",
          },
          work: [
            {
              company: "Tech Innovations Inc.",
              position: "Senior Frontend Developer",
              startDate: "2021-03-01",
              endDate: "Present",
              summary: "Lead frontend development for enterprise SaaS platform",
              highlights: [
                "Architected and implemented a component library used across 5 product teams",
                "Reduced bundle size by 35% through code splitting and lazy loading",
                "Mentored junior developers and led frontend architecture discussions",
                "Implemented CI/CD pipelines that reduced deployment time by 40%",
              ],
            },
            {
              company: "WebSolutions Co.",
              position: "Frontend Developer",
              startDate: "2018-06-01",
              endDate: "2021-02-28",
              summary: "Developed responsive web applications for clients across industries",
              highlights: [
                "Built interactive dashboards using React and D3.js",
                "Implemented responsive designs that work across all device sizes",
                "Collaborated with UX designers to implement pixel-perfect interfaces",
                "Optimized web performance achieving 95+ Lighthouse scores",
              ],
            },
          ],
          education: [
            {
              institution: "University of California, Berkeley",
              area: "Computer Science",
              studyType: "Bachelor of Science",
              startDate: "2014-09-01",
              endDate: "2018-05-30",
              gpa: "3.8",
            },
          ],
          skills: [
            {
              name: "Frontend Development",
              level: "Expert",
              keywords: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
            },
            {
              name: "Tools & Frameworks",
              level: "Advanced",
              keywords: ["Next.js", "Redux", "Webpack", "Jest", "Testing Library", "Git"],
            },
            {
              name: "Backend Development",
              level: "Intermediate",
              keywords: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST APIs", "GraphQL"],
            },
          ],
          projects: [
            {
              name: "E-commerce Platform",
              description: "A full-featured e-commerce platform with product management, cart, and checkout",
              startDate: "2022-01-01",
              endDate: "2022-06-30",
              url: "https://github.com/alexjohnson/ecommerce-platform",
              highlights: [
                "Built with Next.js, TypeScript, and Tailwind CSS",
                "Implemented Stripe payment integration",
                "Created a headless CMS for product management",
                "Optimized for SEO and accessibility",
              ],
            },
            {
              name: "Weather Dashboard",
              description: "Real-time weather dashboard with location search and forecasts",
              startDate: "2021-08-01",
              endDate: "2021-10-15",
              url: "https://weather-dashboard-demo.vercel.app",
              highlights: [
                "Used React with custom hooks for state management",
                "Integrated with OpenWeather API",
                "Implemented geolocation for current location weather",
                "Added responsive charts for temperature and precipitation",
              ],
            },
          ],
        })
      }, 1500)
    })
  }
  