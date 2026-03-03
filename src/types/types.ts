export interface Education {
  institution: string;
  degree: string;
  period: string;
  description: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Skill {
  name: string;
  level: number;
  category?: string;
}

export interface Hobby {
  name: string;
  icon: string;
}

export interface Introduction {
    name: string;
    title: string;
    bio: string;
    profileImage: string;
}

export interface AboutData {
  introduction: Introduction;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  hobbies: Hobby[];
}