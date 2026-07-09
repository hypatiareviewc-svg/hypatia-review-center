export const navLinks = [
  { href: "/", label: "Home" },
  { label: "About", items: [
    { href: "/about", label: "About" },
    { href: "/programs", label: "Programs" },
    { href: "/faculty", label: "Lecturer" },
    { href: "/gallery", label: "Gallery" },
    { href: "/student-portal", label: "Students" },
  ] },
  { href: "/news", label: "News" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const heroSlides = [
  {
    eyebrow: "Licensure Examination for Criminologists",
    title: "Prepare Today. Become a Licensed Criminologist Tomorrow.",
    description:
      "Hypatia Review Center delivers a disciplined, institution-grade review experience for aspiring criminologists who expect structure, expertise, and measurable progress.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "Academic Excellence",
    title: "Guided by Experts, Grounded in Board-Ready Practice.",
    description:
      "Every class is anchored by subject specialists, weekly assessments, and careful feedback so students can improve with clarity and confidence.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "Trusted Review Culture",
    title: "A Professional Environment That Feels Like a Serious Institution.",
    description:
      "From lecture materials to student support, the experience is designed to reflect the standards of a respected educational organization.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  },
] as const;

export const stats = [
  { value: 1000, suffix: "+", label: "Graduates" },
  { value: 95, suffix: "%", label: "Student Satisfaction" },
  { value: 50, suffix: "+", label: "Board Topnotchers" },
  { value: 20, suffix: "+", label: "Expert Lecturers" },
  { value: 10, suffix: "+", label: "Years of Excellence" },
] as const;

export const story = {
  history:
    "Hypatia Review Center was founded to provide structured, values-driven review programs for criminology graduates who want serious preparation for the board examination.",
  mission:
    "Provide high-quality review programs that prepare aspiring criminologists to excel in the Licensure Examination for Criminologists.",
  vision:
    "To become one of the country's most trusted criminology review centers known for excellence, integrity, and outstanding board examination performance.",
};

export const values = [
  "Academic rigor",
  "Integrity and professionalism",
  "Student-centered mentoring",
  "Measurable progress",
  "Institutional credibility",
] as const;

export const timeline = [
  { year: "2014", title: "Foundation", text: "Hypatia opened its first review classes with a small cohort of criminology graduates." },
  { year: "2018", title: "Regional Reach", text: "The center expanded its weekend and weekday schedules to support diverse student needs." },
  { year: "2022", title: "Board Focus", text: "Weekly diagnostics and mock boards became a central part of the review model." },
  { year: "Today", title: "Trusted Institution", text: "Hypatia serves students who expect a serious, organized, and supportive review environment." },
] as const;

export const whyChooseUs = [
  "Subject-specialist lecturers with real board-exam familiarity",
  "Structured study plans and weekly progress checks",
  "Mock boards, performance analytics, and mentoring sessions",
  "Professional student support and clear enrollment guidance",
] as const;

export const programSubjects = [
  "Criminal Law",
  "Criminalistics",
  "Law Enforcement Administration",
  "Crime Detection and Investigation",
  "Criminal Sociology",
  "Correctional Administration",
  "Jurisprudence",
  "Ethics",
  "Board Exam Simulation",
  "Mock Examinations",
] as const;

export const programs = [
  {
    title: "Licensure Examination for Criminologists (LEC)",
    duration: "12-week intensive review",
    schedule: "Weekday and weekend sections",
    description:
      "A complete board review program covering core criminology subjects, guided drills, and calibrated assessments designed to prepare students for the LEC.",
    features: ["Lecture modules", "Diagnostic exams", "Mentoring", "Mock boards"],
  },
  {
    title: "Final Coaching Program",
    duration: "4-week focused review",
    schedule: "Evening sessions",
    description:
      "An accelerated program for graduates who need targeted review, corrective feedback, and last-mile readiness before the board examination.",
    features: ["Exam strategies", "Problem sets", "Performance analytics", "Q&A clinics"],
  },
  {
    title: "Board Readiness Seminar",
    duration: "1-day academic seminar",
    schedule: "Scheduled monthly",
    description:
      "A professional seminar covering exam discipline, study organization, and practical tips for managing the LEC review cycle.",
    features: ["Study planning", "Mentor talks", "Exam discipline", "Enrollment guidance"],
  },
] as const;

export const learningApproach = [
  { title: "Review Classes", text: "Disciplined lectures that organize each subject into practical, board-focused lessons." },
  { title: "Practice Exams", text: "Regular written checks that help students see what they know and what still needs work." },
  { title: "Weekly Assessments", text: "Short, repeatable assessments that make student progress visible and measurable." },
  { title: "Coaching Sessions", text: "Small-group sessions for clarification, motivation, and personalized study advice." },
  { title: "Mock Boards", text: "Full-length simulations designed to build pacing, focus, and exam stamina." },
  { title: "Performance Analytics", text: "Results reporting that helps students and lecturers target weak areas efficiently." },
] as const;

export const lecturers = [
  {
    name: "Dr. Renato M. Flores",
    title: "Program Director",
    background: "PhD in Criminology, MA in Public Administration",
    experience: "18 years in criminology education and board review leadership",
    specialization: "Criminal Law and Jurisprudence",
    achievements: "Led multiple top-performing review batches and authored board preparation modules.",
    photo:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80",
    bio:
      "Dr. Flores oversees academic standards and ensures the review program remains structured, rigorous, and responsive to board-exam expectations.",
  },
  {
    name: "Prof. Ma. Elena C. Santos",
    title: "Senior Lecturer",
    background: "MS in Criminology, BS in Criminal Justice",
    experience: "15 years of teaching and review instruction",
    specialization: "Criminalistics and Crime Detection",
    achievements: "Known for practical lecture delivery and strong student consultation support.",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    bio:
      "Prof. Santos focuses on detailed subject mastery, guiding students through complex material with clarity and patience.",
  },
  {
    name: "Atty. Jose P. Navarro",
    title: "Law and Ethics Lecturer",
    background: "Doctor of Jurisprudence, BA Political Science",
    experience: "12 years in legal education and professional training",
    specialization: "Ethics, Jurisprudence, and Law Enforcement Administration",
    achievements: "Provides board-oriented legal explanations grounded in real-world practice.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    bio:
      "Atty. Navarro connects board concepts to the legal and ethical responsibilities expected of licensed criminologists.",
  },
  {
    name: "Dr. Christine V. Reyes",
    title: "Assessment and Mentoring Lead",
    background: "PhD in Educational Measurement",
    experience: "10 years in assessment design and learner support",
    specialization: "Mock boards and performance analytics",
    achievements: "Developed the center's diagnostic and progress-tracking framework.",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80",
    bio:
      "Dr. Reyes helps students interpret results correctly and build a study path that is realistic and measurable.",
  },
] as const;

export const testimonials = [
  {
    name: "Maria Lourdes P.",
    school: "Northern Luzon State University",
    batch: "Batch 2025",
    rating: 5,
    review:
      "The structure of the review program made it easier to study with purpose. The lectures, diagnostics, and mock boards felt disciplined and complete.",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Jomar D.",
    school: "Central Philippine College",
    batch: "Batch 2024",
    rating: 5,
    review:
      "What stood out was the professionalism. The lecturers were direct, supportive, and very organized in the way they handled the review cycle.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Angela R.",
    school: "Metro Manila College",
    batch: "Batch 2023",
    rating: 5,
    review:
      "Hypatia gave me the confidence to face the board. The weekly assessments and coaching sessions were exactly what I needed.",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  },
] as const;

export const passers = [
  { name: "Ramon V. Cruz", school: "University of Baguio", year: "2025" },
  { name: "Jessa L. Aquino", school: "Lyceum of the Philippines", year: "2025" },
  { name: "Mark Angelo T.", school: "Cavite State University", year: "2024" },
  { name: "Princess F. Dela Cruz", school: "Saint Louis University", year: "2024" },
] as const;

export const newsItems = [
  {
    title: "Enrollment Schedule for the Next Review Cycle Now Open",
    category: "Enrollment",
    date: "July 15, 2026",
    summary: "Applications are now accepted for weekday and weekend LEC review sections.",
  },
  {
    title: "Board Readiness Seminar Set for August Session",
    category: "Seminar",
    date: "August 3, 2026",
    summary: "A one-day academic seminar focused on study discipline, pacing, and exam confidence.",
  },
  {
    title: "Updated Mock Board Calendar Released",
    category: "Review Program",
    date: "August 12, 2026",
    summary: "Students can now view the scheduled diagnostic and full-length mock board sessions.",
  },
] as const;

export const announcements = [
  {
    title: "Enrollment for SY 2026–2027 Review Batch Is Now Open",
    category: "Urgent",
    date: "July 8, 2026",
    summary: "Weekday and weekend LEC sections are accepting applications. Secure your slot before slots fill up.",
    pinned: true,
  },
  {
    title: "Room Assignment and Orientation Schedule Posted",
    category: "Advisory",
    date: "July 5, 2026",
    summary: "Enrolled students may view room assignments and the first-week orientation schedule at the admissions desk.",
    pinned: false,
  },
  {
    title: "Holiday Class Suspension — July 12",
    category: "Schedule",
    date: "July 3, 2026",
    summary: "Regular review classes on July 12 are suspended. Makeup sessions will be announced through the student portal.",
    pinned: false,
  },
] as const;

export const calendarActivities = [
  {
    title: "Board Readiness Seminar",
    date: "2026-08-03",
    time: "9:00 AM – 4:00 PM",
    venue: "Hypatia Main Hall",
    type: "Seminar",
  },
  {
    title: "Criminal Law Intensive Lecture",
    date: "2026-08-08",
    time: "1:00 PM – 5:00 PM",
    venue: "Review Room B",
    type: "Lecture",
  },
  {
    title: "Diagnostic Examination — Week 1",
    date: "2026-08-12",
    time: "8:00 AM – 12:00 NN",
    venue: "Testing Center",
    type: "Assessment",
  },
  {
    title: "Mock Board Simulation",
    date: "2026-08-22",
    time: "7:30 AM – 5:30 PM",
    venue: "Hypatia Main Hall",
    type: "Mock Board",
  },
  {
    title: "Parent & Guardian Orientation",
    date: "2026-08-28",
    time: "2:00 PM – 4:00 PM",
    venue: "Conference Room",
    type: "Orientation",
  },
] as const;

export const faqs = [
  {
    question: "What are the enrollment requirements?",
    answer:
      "Applicants typically need a valid school record, a recent photo, and the completed enrollment form. Specific requirements are shared before registration.",
  },
  {
    question: "How long is the review program?",
    answer:
      "Our main LEC program runs for 12 weeks, with additional coaching and short seminar options available for focused preparation.",
  },
  {
    question: "Do you offer online or hybrid options?",
    answer:
      "Yes. Select review schedules can be attended in hybrid mode depending on the enrollment period and lecturer availability.",
  },
  {
    question: "How are mock boards conducted?",
    answer:
      "Mock boards mirror the format, timing, and pacing of the actual exam so students can practice under realistic conditions.",
  },
] as const;

export const contactInfo = {
  address: "4th Floor, Ricleah Building, Hemingway Street, Roxas City, Capiz",
  mapsPlusCode: "HQF4+9J Roxas City, Capiz",
  phone: "+63 917 555 0421",
  email: "admissions@hypatiareviewcenter.edu.ph",
  hours: "Monday to Saturday, 8:00 AM to 6:00 PM",
  facebook: "https://facebook.com",
  messenger: "https://m.me",
  mapsUrl: "https://maps.google.com/maps?q=HQF4%2B9J+Roxas+City,+Capiz&z=17&output=embed",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=HQF4%2B9J+Roxas+City,+Capiz",
};

export const quickSearchItems = [
  { label: "About Hypatia", href: "/about", description: "History, mission, vision, values." },
  { label: "LEC Programs", href: "/programs", description: "Review subjects and schedules." },
  { label: "Faculty", href: "/faculty", description: "Meet the lecturers and specialists." },
  { label: "Admissions", href: "/admissions", description: "Enrollment requirements and schedule." },
  { label: "News", href: "/news", description: "Announcements and review updates." },
] as const;
