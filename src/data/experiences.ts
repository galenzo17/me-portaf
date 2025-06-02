import { translations } from "../i18n/translations";
export interface Experience {
  company: string;
  url: string;
  period: string;
  role: string;
  description: string[];
  stack: string[];
}

export const getExperiences = (lang: 'en' | 'es'): Experience[] => [
  {
    company: 'Buk',
    url: 'https://buk.cl/',
    period: lang === 'en' ? 'May 2022 - Present' : 'Mayo 2022 - Actualidad',
    role: translations[lang].companies.buk.role,
    description: translations[lang].companies.buk.description,
    stack: [
      'NestJS',
      'React',
      'Python',
      'TypeScript',
      'Shinkansen',
      'Minka',
      'Líquido',
      'SFTP',
      'Cobre.co'
    ]
  },
  {
    company: 'Crece.pro',
    url: 'https://web.crece.pro/',
    period: lang === 'en' ? 'October 2021 - May 2022' : 'Octubre 2021 - Mayo 2022',
    role: translations[lang].companies.crece.role,
    description: translations[lang].companies.crece.description,
    stack: [
      'Laravel',
      'Vue',
      'MySQL',
      'Firebase',
      'Docker',
      'React',
      'Flutter',
      'SendGrid',
      'Twilio',
      'MercadoPago'
    ]
  },
  {
    company: 'Wolke',
    url: 'https://www.wolke.cl/',
    period: lang === 'en' ? 'March 2019 - September 2021' : 'Marzo 2019 - Septiembre 2021',
    role: translations[lang].companies.wolke.role,
    description: translations[lang].companies.wolke.description,
    stack: [
      'Node',
      'React',
      '.NET',
      'Python',
      'MongoDB',
      'SQL Server',
      'Docker',
      'React Native',
      'AWS',
      'Azure',
      'OpenCV',
      'TensorFlow'
    ]
  },
  {
    company: 'Impotec',
    url: 'https://impotec.cl/',
    period: lang === 'en' ? 'January 2018 - February 2019' : 'Enero 2018 - Febrero 2019',
    role: translations[lang].companies.impotec.role,
    description: translations[lang].companies.impotec.description,
    stack: ['Node', 'React', 'MongoDB', 'MySQL', 'Docker']
  },
  {
    company: 'Pehuén Digital',
    url: 'https://www.pehuendigital.com/',
    period: lang === 'en' ? 'January 2011 - December 2017' : 'Enero 2011 - Diciembre 2017',
    role: translations[lang].companies.pehuen.role,
    description: translations[lang].companies.pehuen.description,
    stack: ['Unity3D', '.NET', 'PostgreSQL']
  }
];
