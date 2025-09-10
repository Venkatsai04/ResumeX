export interface CvData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  experience: {
    company: string;
    position: string;
    duration: string;
    duties: string[];
  }[];
  education: {
    degree: string;
    university: string;
    duration: string;
  }[];
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
  };
}

export const data: CvData = {
  name: "Your Name",
  title: "Full Stack Developer",
  contact: {
    email: "your.email@example.com",
    phone: "+1234567890",
    linkedin: "linkedin.com/in/yourprofile",
    github: "github.com/yourprofile",
  },
  summary:
    "Experienced Full Stack Developer with a passion for building robust and scalable web applications. Proficient in both front-end and back-end technologies, with expertise in JavaScript, React, Node.js, and Python. Proven ability to lead projects from concept to deployment.",
  experience: [
    {
      company: "Tech Solutions Inc.",
      position: "Senior Software Engineer",
      duration: "Jan 2022 - Present",
      duties: [
        "Led a team of 5 developers to design and implement a new microservices architecture using Node.js and Express.",
        "Developed and maintained responsive user interfaces with React and Redux, improving user engagement by 25%.",
        "Managed database schema and performed optimizations in MongoDB, resulting in a 30% reduction in query times.",
      ],
    },
    {
      company: "Innovate Co.",
      position: "Software Developer",
      duration: "Jun 2019 - Dec 2021",
      duties: [
        "Built and deployed full-stack features using Python, Django, and React.",
        "Collaborated with UX/UI designers to translate wireframes into interactive web applications.",
        "Authored comprehensive test suites with Jest and Pytest to ensure code quality and stability.",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      university: "University of Tech",
      duration: "2015 - 2019",
    },
  ],
  skills: {
    languages: ["JavaScript", "Python", "TypeScript", "HTML", "CSS"],
    frameworks: ["React", "Node.js", "Django", "Express", "Tailwind CSS"],
    databases: ["MongoDB", "PostgreSQL", "MySQL"],
    tools: ["Git", "Docker", "AWS", "Jira"],
  },
};