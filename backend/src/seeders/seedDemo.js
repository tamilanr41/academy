/**
 * Demo seed data for local development ONLY.
 * Every created document is flagged with isDemo: true so it can be identified
 * and removed. Never run this against a production database.
 */
const { connectDB, disconnectDB } = require('../config/db');
const env = require('../config/env');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CourseCategory = require('../models/CourseCategory');
const Course = require('../models/Course');
const Trainer = require('../models/Trainer');
const Batch = require('../models/Batch');
const CourseApplication = require('../models/CourseApplication');
const Enquiry = require('../models/Enquiry');
const Enrollment = require('../models/Enrollment');
const Testimonial = require('../models/Testimonial');
const Event = require('../models/Event');
const GalleryItem = require('../models/GalleryItem');
const Faq = require('../models/Faq');
const Announcement = require('../models/Announcement');
const SiteSetting = require('../models/SiteSetting');
const Payment = require('../models/Payment');

const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const categories = [
  { name: 'Software Courses', icon: 'Code2', description: 'MS Office, Tally, programming, AI, data and digital marketing — job-oriented computer courses with practical training.', order: 1 },
  { name: 'Spoken English', icon: 'Languages', description: 'Fluency, grammar, vocabulary, interview and daily speaking practice across three levels.', order: 2 },
  { name: 'Kids Courses', icon: 'Baby', description: 'Fun, beginner-friendly computer courses designed for young learners.', order: 3 },
];

const trainerData = [
  { name: 'Anita Raghavan', designation: 'Lead Full-Stack Mentor', experienceYears: 12, qualifications: ['M.Tech Computer Science', 'AWS Certified Solutions Architect'], specializations: ['React', 'Node.js', 'System Design'], bio: 'Anita has trained 3,000+ learners and led engineering teams at product startups. Her classes focus on building production-grade projects.', photo: img('1573497019940-1c28c88b4f3e', 600), order: 1 },
  { name: 'Vikram Menon', designation: 'Data Science & AI Faculty', experienceYears: 10, qualifications: ['M.Sc Statistics', 'TensorFlow Developer Certificate'], specializations: ['Python', 'Machine Learning', 'MLOps'], bio: 'Vikram is a former analytics lead who now teaches applied machine learning with a strong focus on industry datasets.', photo: img('1580489944761-15a19d654956', 600), order: 2 },
  { name: 'Ramesh Kumar', designation: 'Software & Programming Faculty', experienceYears: 9, qualifications: ['MCA', 'Oracle Certified Professional (Java)'], specializations: ['Python', 'Java', 'Tally', 'MS Office'], bio: 'Ramesh has coached students from colleges across Tamil Nadu into software roles through practical, code-every-day classes.', photo: img('1519085360753-af0119f7cbe7', 600), order: 3 },
  { name: 'Kavitha Sundaram', designation: 'Spoken English & Communication Facilitator', experienceYears: 8, qualifications: ['M.A English', 'Certified ELT Trainer'], specializations: ['Fluency', 'Grammar', 'Interview Training', 'Group Discussion'], bio: 'Kavitha runs our spoken English levels with daily speaking practice, GDs and interview drills that build real confidence.', photo: img('1544005313-94ddf0286df2', 600), order: 4 },
  { name: 'Suresh Kumar', designation: 'Digital Marketing Trainer', experienceYears: 7, qualifications: ['B.Com', 'Google Ads Certified'], specializations: ['SEO', 'Social Media', 'Google Ads', 'Analytics'], bio: 'Suresh runs live campaign workshops and keeps classes focused on what actually works for local businesses.', photo: img('1507003211169-0a1dd7228f2d', 600), order: 5 },
];

const courseData = [
  {
    title: 'MS Office & Computer Applications',
    category: 'Software Courses',
    level: 'beginner',
    mode: 'offline',
    fee: 0,
    durationText: '4 weeks',
    durationWeeks: 4,
    shortDescription: 'Word, Excel, PowerPoint and everyday computer skills for office jobs and competitive exams.',
    description: 'A practical starter course covering MS Word, Excel (formulas, pivot tables), PowerPoint and essential computer operations. Built for students and job seekers who need confident, everyday office skills.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['No prior experience required'],
    learningOutcomes: ['Create and format documents professionally', 'Work with Excel formulas, charts and pivot tables', 'Build effective presentations', 'Handle files, printing and basic troubleshooting'],
    curriculum: [
      { title: 'Computer & Windows Essentials', duration: '1 week', description: 'Files, folders, typing, printing and internet basics.' },
      { title: 'MS Word', duration: '1 week', description: 'Formatting, tables, mail merge and reports.' },
      { title: 'MS Excel', duration: '1.5 weeks', description: 'Formulas, functions, charts and pivot tables.' },
      { title: 'PowerPoint & Assessment', duration: '0.5 weeks', description: 'Presentations and a hands-on final test.' },
    ],
    faqs: [{ question: 'Do I need my own laptop?', answer: 'No, lab systems are provided. You may bring your own laptop if you prefer.' }],
    tags: ['ms office', 'excel', 'word', 'computer basics'],
    isFeatured: false,
  },
  {
    title: 'Tally Prime with GST',
    category: 'Software Courses',
    level: 'beginner',
    mode: 'offline',
    fee: 0,
    durationText: '8 weeks',
    durationWeeks: 8,
    shortDescription: 'Complete accounting with Tally Prime, GST billing, returns and inventory — job-oriented training.',
    description: 'Learn practical accounting on Tally Prime: vouchers, GST billing and returns, inventory, payroll basics and reports. Ideal for commerce students, shop owners and aspiring accountants.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['Basic accounting knowledge helps but is not mandatory'],
    learningOutcomes: ['Enter vouchers and manage ledgers confidently', 'Generate GST invoices and file-ready reports', 'Manage inventory and stock groups', 'Produce balance sheet and P&L reports'],
    curriculum: [
      { title: 'Accounting Fundamentals', duration: '2 weeks', description: 'Ledgers, vouchers and double-entry basics.' },
      { title: 'Tally Prime Operations', duration: '2 weeks', description: 'Company setup, entries and inventory.' },
      { title: 'GST & Taxation', duration: '2.5 weeks', description: 'GST invoicing, returns and tax reports.' },
      { title: 'Reports & Practice', duration: '1.5 weeks', description: 'Financial statements and real-world company data.' },
    ],
    faqs: [{ question: 'Will I get a certificate?', answer: 'Yes, a Magma Minds certificate is issued after the final assessment.' }],
    tags: ['tally', 'gst', 'accounting'],
    isFeatured: true,
  },
  {
    title: 'C++ Programming',
    category: 'Software Courses',
    level: 'beginner',
    mode: 'hybrid',
    fee: 0,
    durationText: '8 weeks',
    durationWeeks: 8,
    shortDescription: 'Build strong programming logic with C++ — the classic foundation for students and placements.',
    description: 'A structured C++ course covering syntax, functions, arrays, pointers, OOP and data structures. Daily coding practice with placement-oriented problem solving.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['No prior experience required'],
    learningOutcomes: ['Write and debug C++ programs confidently', 'Apply OOP concepts like classes and inheritance', 'Solve basic data structure problems', 'Attempt placement-level programming questions'],
    curriculum: [
      { title: 'Basics & Control Flow', duration: '2 weeks', description: 'Types, operators, conditionals, loops.' },
      { title: 'Functions & Arrays', duration: '2 weeks', description: 'Modular code, arrays and strings.' },
      { title: 'Object-Oriented C++', duration: '2.5 weeks', description: 'Classes, inheritance, polymorphism.' },
      { title: 'Pointers & Problem Solving', duration: '1.5 weeks', description: 'Pointers, files and placement practice.' },
    ],
    faqs: [{ question: 'Is C++ still useful?', answer: 'Yes — it builds strong logic and is widely used in placements, embedded and systems work.' }],
    tags: ['c++', 'programming', 'placement'],
    isFeatured: false,
  },
  {
    title: 'Java Programming',
    category: 'Software Courses',
    level: 'intermediate',
    mode: 'hybrid',
    fee: 0,
    durationText: '10 weeks',
    durationWeeks: 10,
    shortDescription: 'Core Java, collections and JDBC with hands-on projects — a top choice for placement preparation.',
    description: 'Move from programming fundamentals to building real Java applications. Covers core Java, OOP, collections, exception handling, multithreading and JDBC with mini projects.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['Basic programming concepts (C/C++ helpful)'],
    learningOutcomes: ['Build console and GUI applications', 'Use collections and generics effectively', 'Connect Java programs to a database', 'Prepare for Java interviews and certifications'],
    curriculum: [
      { title: 'Core Java', duration: '3 weeks', description: 'Syntax, OOP, arrays and strings.' },
      { title: 'Advanced Language Features', duration: '3 weeks', description: 'Collections, exceptions, threads, files.' },
      { title: 'JDBC & Projects', duration: '3 weeks', description: 'Database connectivity and a mini project.' },
      { title: 'Interview Preparation', duration: '1 week', description: 'Practice questions and mock rounds.' },
    ],
    faqs: [{ question: 'Is Java still in demand?', answer: 'Yes — Java remains a top language for enterprise, Android and campus placements.' }],
    tags: ['java', 'programming', 'jdbc'],
    isFeatured: false,
  },
  {
    title: 'Python Programming',
    category: 'Software Courses',
    level: 'beginner',
    mode: 'hybrid',
    fee: 0,
    durationText: '8 weeks',
    durationWeeks: 8,
    shortDescription: 'Learn Python from scratch with real automation projects — the easiest first programming language.',
    description: 'A beginner-friendly Python program covering syntax, data structures, functions, file handling and automation. Perfect for students, career switchers and anyone who wants to automate daily work.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['No prior experience required'],
    learningOutcomes: ['Write clean Python programs', 'Use data structures confidently', 'Automate files, reports and tasks', 'Build a small project for your portfolio'],
    curriculum: [
      { title: 'Python Basics', duration: '3 weeks', description: 'Syntax, control flow, functions and modules.' },
      { title: 'Data Structures', duration: '2 weeks', description: 'Lists, dictionaries, sets and comprehensions.' },
      { title: 'Files & Automation', duration: '2 weeks', description: 'File handling, APIs and scheduled scripts.' },
      { title: 'Mini Project', duration: '1 week', description: 'Build and present a CLI automation tool.' },
    ],
    faqs: [{ question: 'Is this suitable for absolute beginners?', answer: 'Yes, this is our recommended starting point for complete beginners.' }],
    tags: ['python', 'beginners', 'automation'],
    isFeatured: true,
  },
  {
    title: '.NET Development',
    category: 'Software Courses',
    level: 'intermediate',
    mode: 'offline',
    fee: 0,
    durationText: '12 weeks',
    durationWeeks: 12,
    shortDescription: 'C#, ASP.NET and SQL Server — build and deploy real Windows and web applications.',
    description: 'A job-oriented .NET track covering C# programming, Windows Forms, ASP.NET web basics and SQL Server database development, finishing with a deployed project.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['Basic programming knowledge'],
    learningOutcomes: ['Develop desktop applications in C#', 'Build web pages with ASP.NET', 'Design and query SQL Server databases', 'Deliver a complete final project'],
    curriculum: [
      { title: 'C# Fundamentals', duration: '3 weeks', description: 'Syntax, OOP and exception handling.' },
      { title: 'Windows Forms', duration: '3 weeks', description: 'UI, controls and data binding.' },
      { title: 'ASP.NET & Web Basics', duration: '3 weeks', description: 'Pages, controls and server-side logic.' },
      { title: 'SQL Server & Project', duration: '3 weeks', description: 'Database design and a final application.' },
    ],
    faqs: [{ question: 'Do companies still use .NET?', answer: 'Yes — .NET powers a large share of enterprise and banking software in India.' }],
    tags: ['.net', 'c#', 'asp.net'],
    isFeatured: false,
  },
  {
    title: 'Artificial Intelligence (AI)',
    category: 'Software Courses',
    level: 'advanced',
    mode: 'hybrid',
    fee: 0,
    durationText: '14 weeks',
    durationWeeks: 14,
    shortDescription: 'Understand and build AI systems — from intelligent agents to modern generative AI workflows.',
    description: 'A practical introduction to artificial intelligence covering search algorithms, machine learning basics, NLP, computer vision and today’s generative AI tools, with a hands-on capstone.',
    trainers: ['Vikram Menon'],
    prerequisites: ['Python basics', 'School-level mathematics'],
    learningOutcomes: ['Explain core AI concepts clearly', 'Build rule-based and learning systems', 'Work with modern AI APIs and tools', 'Complete an applied AI capstone'],
    curriculum: [
      { title: 'Foundations of AI', duration: '3 weeks', description: 'Intelligent agents, search and logic.' },
      { title: 'Learning Systems', duration: '4 weeks', description: 'Supervised and unsupervised learning.' },
      { title: 'NLP & Vision', duration: '4 weeks', description: 'Text, speech and image fundamentals.' },
      { title: 'Generative AI & Capstone', duration: '3 weeks', description: 'LLM workflows and final project.' },
    ],
    faqs: [{ question: 'Do I need maths for AI?', answer: 'Basic maths is enough to start; we cover the rest as the course progresses.' }],
    tags: ['ai', 'generative ai', 'nlp'],
    isFeatured: false,
  },
  {
    title: 'Machine Learning (ML)',
    category: 'Software Courses',
    level: 'advanced',
    mode: 'hybrid',
    fee: 0,
    durationText: '16 weeks',
    durationWeeks: 16,
    shortDescription: 'Regression to deployment — practical machine learning with real datasets and projects.',
    description: 'Hands-on machine learning: data preparation, feature engineering, model training, evaluation and deployment using scikit-learn and real industry datasets.',
    trainers: ['Vikram Menon'],
    prerequisites: ['Python programming', 'Basic statistics'],
    learningOutcomes: ['Preprocess and engineer features', 'Train and evaluate ML models', 'Avoid overfitting with proper validation', 'Deploy a model as a working service'],
    curriculum: [
      { title: 'ML Foundations', duration: '3 weeks', description: 'Types of learning, metrics and workflows.' },
      { title: 'Classical Models', duration: '5 weeks', description: 'Regression, trees, ensembles and clustering.' },
      { title: 'Feature Engineering & Tuning', duration: '4 weeks', description: 'Preprocessing, pipelines and hyperparameters.' },
      { title: 'Deployment & Capstone', duration: '4 weeks', description: 'Model serving and a final ML project.' },
    ],
    faqs: [{ question: 'Is there a certificate?', answer: 'Yes, with project submission and assessment.' }],
    tags: ['machine learning', 'scikit-learn', 'predictive'],
    isFeatured: false,
  },
  {
    title: 'Deep Learning (DL)',
    category: 'Software Courses',
    level: 'advanced',
    mode: 'online',
    fee: 0,
    durationText: '16 weeks',
    durationWeeks: 16,
    shortDescription: 'Neural networks, CNNs and sequence models using TensorFlow — with real image and text projects.',
    description: 'An applied deep learning program covering neural networks, computer vision with CNNs, sequence models and modern architectures, training on GPU labs.',
    trainers: ['Vikram Menon'],
    prerequisites: ['Python and machine learning basics'],
    learningOutcomes: ['Design and train neural networks', 'Build image classification models', 'Work with text and sequence data', 'Optimise and deploy trained models'],
    curriculum: [
      { title: 'Neural Network Basics', duration: '3 weeks', description: 'Perceptrons, activations and backpropagation.' },
      { title: 'Computer Vision', duration: '5 weeks', description: 'CNNs, augmentation and transfer learning.' },
      { title: 'Sequence Models', duration: '4 weeks', description: 'RNN, LSTM and embeddings.' },
      { title: 'Project & Optimisation', duration: '4 weeks', description: 'Regularisation, deployment and final project.' },
    ],
    faqs: [{ question: 'Do I need a GPU laptop?', answer: 'No, labs provide GPU workstations and cloud notebooks.' }],
    tags: ['deep learning', 'tensorflow', 'cnn'],
    isFeatured: false,
  },
  {
    title: 'Web Development',
    category: 'Software Courses',
    level: 'intermediate',
    mode: 'hybrid',
    fee: 0,
    durationText: '16 weeks',
    durationWeeks: 16,
    shortDescription: 'HTML to full-stack — build and deploy real websites with modern frontend and backend tools.',
    description: 'A complete web development track: HTML, CSS, JavaScript, React, Node.js, databases and deployment. You finish with multiple live projects in your portfolio.',
    trainers: ['Anita Raghavan'],
    prerequisites: ['Basic computer usage', 'Logical thinking'],
    learningOutcomes: ['Build responsive interfaces with HTML/CSS/JS', 'Create dynamic apps with React', 'Develop REST APIs with Node.js', 'Deploy projects to the live web'],
    curriculum: [
      { title: 'Frontend Foundations', duration: '4 weeks', description: 'HTML, CSS, JavaScript and responsive design.' },
      { title: 'React', duration: '4 weeks', description: 'Components, state, routing and APIs.' },
      { title: 'Backend & Databases', duration: '5 weeks', description: 'Node.js, Express and MongoDB/SQL.' },
      { title: 'Deployment & Portfolio', duration: '3 weeks', description: 'Hosting, Git and final portfolio sites.' },
    ],
    faqs: [{ question: 'Will I build real websites?', answer: 'Yes — every module ends with a project, and you deploy multiple sites live.' }],
    tags: ['web development', 'react', 'node'],
    isFeatured: true,
  },
  {
    title: 'Data Science',
    category: 'Software Courses',
    level: 'intermediate',
    mode: 'hybrid',
    fee: 0,
    durationText: '16 weeks',
    durationWeeks: 16,
    shortDescription: 'Statistics, SQL, Python and storytelling — turn raw data into business decisions.',
    description: 'A job-oriented data science program: statistics, data cleaning, SQL, visualisation and machine learning basics, taught on real business datasets with a portfolio project.',
    trainers: ['Vikram Menon'],
    prerequisites: ['Basic mathematics', 'Comfort with computers'],
    learningOutcomes: ['Clean and explore datasets', 'Query data with SQL', 'Visualise insights clearly', 'Build a data science portfolio project'],
    curriculum: [
      { title: 'Statistics & Data Wrangling', duration: '4 weeks', description: 'Distributions, pandas and cleaning.' },
      { title: 'SQL & Databases', duration: '4 weeks', description: 'Joins, aggregations and window functions.' },
      { title: 'Visualisation & Storytelling', duration: '4 weeks', description: 'Matplotlib, Power BI/Tableau style dashboards.' },
      { title: 'ML for Data Science', duration: '4 weeks', description: 'Predictive models and final capstone.' },
    ],
    faqs: [{ question: 'Is data science good for freshers?', answer: 'Yes — analytics and data roles are among the fastest-growing hiring areas.' }],
    tags: ['data science', 'analytics', 'sql'],
    isFeatured: true,
  },
  {
    title: 'Digital Marketing',
    category: 'Software Courses',
    level: 'beginner',
    mode: 'hybrid',
    fee: 0,
    durationText: '10 weeks',
    durationWeeks: 10,
    shortDescription: 'SEO, social media, Google Ads and analytics — practical digital marketing with live campaigns.',
    description: 'Learn to plan and run real campaigns across search and social, build content calendars, and measure results with analytics. Ideal for job seekers, freelancers and local business owners.',
    trainers: ['Suresh Kumar'],
    prerequisites: ['Basic internet and social media usage'],
    learningOutcomes: ['Optimise sites for search (SEO)', 'Run and measure ad campaigns', 'Plan social media content', 'Report results with analytics'],
    curriculum: [
      { title: 'Marketing Foundations', duration: '2 weeks', description: 'Funnels, audiences and messaging.' },
      { title: 'SEO & Content', duration: '3 weeks', description: 'Keyword research and content strategy.' },
      { title: 'Paid Ads & Social', duration: '3 weeks', description: 'Google Ads and social campaigns.' },
      { title: 'Analytics & Portfolio', duration: '2 weeks', description: 'GA4 reports and campaign portfolio.' },
    ],
    faqs: [{ question: 'Will we run real campaigns?', answer: 'Yes, guided live practice campaigns are part of the course.' }],
    tags: ['digital marketing', 'seo', 'google ads'],
    isFeatured: true,
  },
  {
    title: 'SQL',
    category: 'Software Courses',
    level: 'beginner',
    mode: 'online',
    fee: 0,
    durationText: '6 weeks',
    durationWeeks: 6,
    shortDescription: 'Query, join and analyse data with SQL — the must-have skill for every data role.',
    description: 'A focused SQL course: SELECT queries, joins, aggregations, subqueries, window functions and reporting, practised on real-world datasets.',
    trainers: ['Vikram Menon'],
    prerequisites: ['No prior experience required'],
    learningOutcomes: ['Write complex queries confidently', 'Use joins and aggregations effectively', 'Build reports from relational data', 'Prepare for SQL interview questions'],
    curriculum: [
      { title: 'SQL Basics', duration: '2 weeks', description: 'SELECT, WHERE, ORDER BY and aggregates.' },
      { title: 'Joins & Subqueries', duration: '2 weeks', description: 'Relationships, joins and nested queries.' },
      { title: 'Advanced SQL & Practice', duration: '2 weeks', description: 'Window functions, CTEs and interview sets.' },
    ],
    faqs: [{ question: 'Which databases are covered?', answer: 'MySQL and SQL Server examples, with PostgreSQL notes.' }],
    tags: ['sql', 'database', 'queries'],
    isFeatured: false,
  },
  {
    title: 'Data Analytics',
    category: 'Software Courses',
    level: 'intermediate',
    mode: 'hybrid',
    fee: 0,
    durationText: '10 weeks',
    durationWeeks: 10,
    shortDescription: 'Excel, SQL and Power BI — analyse business data and present dashboards that drive decisions.',
    description: 'An applied analytics program for aspiring analysts: advanced Excel, SQL for analysts, Power BI dashboards and presentation skills using live business data.',
    trainers: ['Vikram Menon'],
    prerequisites: ['Comfort with spreadsheets'],
    learningOutcomes: ['Analyse data with advanced Excel', 'Query with SQL confidently', 'Build interactive Power BI dashboards', 'Present insights to decision makers'],
    curriculum: [
      { title: 'Advanced Excel', duration: '3 weeks', description: 'Lookups, pivots and dashboards.' },
      { title: 'SQL for Analysts', duration: '3 weeks', description: 'Joins, aggregations and window functions.' },
      { title: 'Power BI', duration: '3 weeks', description: 'Modelling, DAX and report design.' },
      { title: 'Capstone Presentation', duration: '1 week', description: 'End-to-end analytics project.' },
    ],
    faqs: [{ question: 'Do you provide Power BI licences?', answer: 'Yes, lab machines have Power BI Desktop installed for practice.' }],
    tags: ['data analytics', 'power bi', 'excel'],
    isFeatured: false,
  },
  {
    title: 'Spoken English - Basic',
    category: 'Spoken English',
    level: 'beginner',
    mode: 'offline',
    fee: 0,
    durationText: '6 weeks',
    durationWeeks: 6,
    shortDescription: 'Build everyday speaking confidence — basic grammar, vocabulary and daily conversation practice.',
    description: 'Start speaking English without fear. The basic level covers simple grammar, everyday vocabulary and daily speaking practice designed for students and beginners from Tamil medium backgrounds.',
    trainers: ['Kavitha Sundaram'],
    prerequisites: ['No prior experience required'],
    learningOutcomes: ['Introduce yourself and converse simply', 'Use basic grammar correctly', 'Learn 500+ everyday words', 'Speak a little English every day with confidence'],
    curriculum: [
      { title: 'Sounds & Sentences', duration: '2 weeks', description: 'Pronunciation, tenses and simple sentences.' },
      { title: 'Everyday Vocabulary', duration: '2 weeks', description: 'Home, market, travel and workplace words.' },
      { title: 'Daily Speaking Practice', duration: '2 weeks', description: 'Pair talks, picture description and review.' },
    ],
    faqs: [{ question: 'Is this class in English only?', answer: 'Instructions are bilingual at this level so nobody is left behind.' }],
    tags: ['spoken english', 'basic', 'fluency'],
    isFeatured: false,
  },
  {
    title: 'Spoken English - Intermediate',
    category: 'Spoken English',
    level: 'intermediate',
    mode: 'offline',
    fee: 0,
    durationText: '8 weeks',
    durationWeeks: 8,
    shortDescription: 'Fluency, grammar in context, vocabulary building and group discussions for real conversations.',
    description: 'Move from hesitating to flowing. This level focuses on fluency drills, grammar in context, vocabulary building and structured group discussions (GD) for college and workplace settings.',
    trainers: ['Kavitha Sundaram'],
    prerequisites: ['Basic level or a short assessment'],
    learningOutcomes: ['Speak continuously on given topics', 'Handle everyday and workplace conversations', 'Lead and participate in group discussions', 'Expand vocabulary and correct common errors'],
    curriculum: [
      { title: 'Fluency Drills', duration: '3 weeks', description: 'Thinking in English and speaking without pauses.' },
      { title: 'Grammar in Context', duration: '2 weeks', description: 'Tenses, modals and error correction.' },
      { title: 'Group Discussions', duration: '2 weeks', description: 'Opinion building, turn-taking and GD practice.' },
      { title: 'Review & Assessment', duration: '1 week', description: 'Mock GD and speaking test.' },
    ],
    faqs: [{ question: 'How many students per batch?', answer: 'Small batches of 12–15 so everyone gets speaking time.' }],
    tags: ['spoken english', 'fluency', 'group discussion'],
    isFeatured: true,
  },
  {
    title: 'Spoken English - Advanced',
    category: 'Spoken English',
    level: 'advanced',
    mode: 'offline',
    fee: 0,
    durationText: '10 weeks',
    durationWeeks: 10,
    shortDescription: 'Interview skills, presentations and workplace communication for job seekers and professionals.',
    description: 'The advanced level prepares you for interviews and the workplace — mock interviews, presentation practice, email and phone etiquette, workplace communication and GD mastery.',
    trainers: ['Kavitha Sundaram'],
    prerequisites: ['Intermediate level or an assessment'],
    learningOutcomes: ['Crack interviews with confident answers', 'Give clear presentations at work', 'Write professional emails and calls', 'Master group discussions and debates'],
    curriculum: [
      { title: 'Interview Training', duration: '3 weeks', description: 'Self introduction, common questions and mock rounds.' },
      { title: 'Workplace Communication', duration: '3 weeks', description: 'Emails, calls, meetings and telephone manner.' },
      { title: 'Presentations & Public Speaking', duration: '2 weeks', description: 'Structure, delivery and stage confidence.' },
      { title: 'GD Mastery & Final Review', duration: '2 weeks', description: 'Advanced GDs and final assessment.' },
    ],
    faqs: [{ question: 'Is this helpful for job interviews?', answer: 'Yes — interview and resume guidance sessions are part of this level.' }],
    tags: ['spoken english', 'interview', 'career'],
    isFeatured: false,
  },
  {
    title: 'Computer Basics for Kids',
    category: 'Kids Courses',
    level: 'beginner',
    mode: 'offline',
    fee: 0,
    durationText: '6 weeks',
    durationWeeks: 6,
    shortDescription: 'Keyboard, paint, typing and internet safety — a friendly first computer course for children.',
    description: 'A fun, hands-on introduction to computers for children: mouse and keyboard skills, Paint, MS Word basics, safe internet use and simple typing games in a supervised lab.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['Age 7+'],
    learningOutcomes: ['Use mouse and keyboard comfortably', 'Create drawings and simple documents', 'Type with correct finger positions', 'Follow basic internet safety rules'],
    curriculum: [
      { title: 'Mouse & Keyboard', duration: '2 weeks', description: 'Clicking, typing games and folder basics.' },
      { title: 'Paint & Word', duration: '2 weeks', description: 'Drawing and simple documents.' },
      { title: 'Safe Internet & Typing', duration: '2 weeks', description: 'Online safety and typing practice.' },
    ],
    faqs: [{ question: 'What is the batch timing for kids?', answer: 'Weekday evenings and weekend morning batches — ask us for the current schedule.' }],
    tags: ['kids', 'computer basics', 'typing'],
    isFeatured: false,
  },
  {
    title: 'Coding for Kids (Scratch)',
    category: 'Kids Courses',
    level: 'beginner',
    mode: 'offline',
    fee: 0,
    durationText: '8 weeks',
    durationWeeks: 8,
    shortDescription: 'Block-based coding — build games and animations while learning real programming logic.',
    description: 'Children learn programming logic the fun way with Scratch — building stories, games and animations step by step, ending with their own mini project to show family and friends.',
    trainers: ['Ramesh Kumar'],
    prerequisites: ['Age 8+ (no coding needed)'],
    learningOutcomes: ['Think logically like a programmer', 'Build games with loops and conditions', 'Design characters and animations', 'Present a finished Scratch project'],
    curriculum: [
      { title: 'Scratch Basics', duration: '2 weeks', description: 'Sprites, stages and first animations.' },
      { title: 'Logic with Blocks', duration: '3 weeks', description: 'Loops, events and conditions.' },
      { title: 'Build a Game', duration: '3 weeks', description: 'Design, test and polish a mini game.' },
    ],
    faqs: [{ question: 'Do kids need their own laptop?', answer: 'No, all practice happens in our kids-friendly computer lab.' }],
    tags: ['kids', 'scratch', 'coding'],
    isFeatured: false,
  },
];

const testimonialData = [
  { name: 'Priyanka S', role: 'College Student', content: 'I joined the Spoken English advanced level and my confidence in interviews changed completely. Daily speaking practice and GDs made the difference.', rating: 5, course: 'Spoken English - Advanced', photo: img('1494790108377-be9c29b29330', 400) },
  { name: 'Karthik V', role: 'Software Developer', content: 'The Java and Python classes were fully practical — we wrote code every day. I cracked my first developer interview after the course.', rating: 5, course: 'Java Programming', photo: img('1500648767791-00dcc994a43e', 400) },
  { name: 'Divya R', role: 'Data Analyst', content: 'SQL and Data Analytics training used real business data. The trainers made queries and dashboards easy to understand.', rating: 5, course: 'Data Analytics', photo: img('1531123897727-8f129e1688ce', 400) },
  { name: 'Suresh B', role: 'Shop Owner', content: 'Tally with GST classes were exactly what I needed for my shop accounts. Affordable fees and flexible weekend batches.', rating: 5, course: 'Tally Prime with GST', photo: img('1507003211169-0a1dd7228f2d', 400) },
  { name: 'Aishwarya M', role: 'Job Seeker', content: 'MS Office plus the practical training gave me the confidence to walk into an office job. Supportive trainers throughout.', rating: 5, course: 'MS Office & Computer Applications', photo: img('1544005313-94ddf0286df2', 400) },
  { name: 'Ramya K', role: 'Parent', content: 'My son enjoys the kids computer classes — he now builds small scratch games at home. Good practical teaching.', rating: 4, course: 'Coding for Kids (Scratch)', photo: img('1519345182560-3f2917c472ef', 400) },
];

const eventData = [
  { title: 'Open Campus & Career Day', description: 'Meet our faculty, tour the labs and attend a career roadmap session with hiring partners. Free to attend with prior registration.', startDate: 12, category: 'seminar', location: 'Main Campus Auditorium', mode: 'offline' },
  { title: 'Weekend React Bootcamp', description: 'A two-day intensive bootcamp covering React fundamentals, hooks and building your first project.', startDate: 24, category: 'workshop', location: 'Online (Zoom)', mode: 'online' },
  { title: 'Industry Talk: AI in Product Teams', description: 'A panel discussion with data leaders on how AI is changing product development workflows.', startDate: 38, category: 'seminar', location: 'Online (Zoom)', mode: 'online' },
  { title: 'Hackathon: Build for Good', description: 'A 36-hour student hackathon with mentors, prizes and internship opportunities for the top teams.', startDate: 55, category: 'cultural', location: 'Innovation Lab', mode: 'offline' },
];

const galleryData = [
  { title: 'Interactive classroom sessions', category: 'classroom', caption: 'Small cohorts ensure every learner gets mentor attention.', image: img('1524178232363-1fb2b075b655') },
  { title: 'Hands-on computer lab', category: 'campus', caption: 'Modern labs with dual-monitor workstations.', image: img('1517245386807-bb43f82c33c4') },
  { title: 'Project presentation day', category: 'event', caption: 'Students present capstone projects to industry mentors.', image: img('1531482615713-2afd69097998') },
  { title: 'Collaborative study zones', category: 'campus', caption: 'Open study areas for group work and pair programming.', image: img('1522202176988-66273c2fd55f') },
  { title: 'Graduation ceremony', category: 'achievement', caption: 'Celebrating our newest cohort of graduates.', image: img('1523580494863-6f3031224c94') },
  { title: 'Mentor review sessions', category: 'classroom', caption: 'One-on-one code reviews with industry mentors.', image: img('1552664730-d307ca884978') },
];

const faqData = [
  { question: 'How do I enrol in a course?', answer: 'Browse the courses page, open the course you like, and submit the application form. Our admissions team will contact you within one working day.', category: 'admissions', order: 1 },
  { question: 'Do you offer online and offline classes?', answer: 'Yes. Every course lists its available modes — online, offline or hybrid. You can filter courses by mode on the courses page.', category: 'courses', order: 2 },
  { question: 'Can I pay the course fee in instalments?', answer: 'Instalment plans are available for programs longer than 12 weeks. Talk to our admissions team for a plan that suits you.', category: 'payments', order: 3 },
  { question: 'Will I receive a certificate?', answer: 'Yes. You receive a verifiable certificate after completing the curriculum and the capstone project.', category: 'certificates', order: 4 },
  { question: 'What are the batch sizes?', answer: 'Batches are capped at 20–30 learners so mentors can review work individually.', category: 'general', order: 5 },
  { question: 'Do you provide placement assistance?', answer: 'Yes. Career services include resume building, mock interviews, portfolio reviews and referrals to hiring partners.', category: 'general', order: 6 },
  { question: 'What if I miss a live class?', answer: 'All live sessions are recorded. You also get access to doubt-clearing sessions twice a week.', category: 'courses', order: 7 },
  { question: 'Is there a refund policy?', answer: 'Fees are refundable on a pro-rata basis within the first two weeks of a batch, as per our terms and conditions.', category: 'payments', order: 8 },
];

async function seedDemo() {
  const settings = await SiteSetting.getSettings();
    settings.academyName = 'Magma Minds Academy';
  settings.tagline = 'No. 1 Computer Training and Spoken English Classes in Tiruppur';
  settings.logo = { url: '/logo.png', publicId: '' };
  settings.contact.email = 'magmaminds@gmail.com';
  settings.contact.phone = '+91 96555 33886';
  settings.contact.address = {
    line1: 'Magma Minds Academy',
    line2: '',
    city: 'Tiruppur',
    state: 'Tamil Nadu',
    pincode: '641604',
    country: 'India',
  };
  settings.social = { facebook: '', instagram: '', youtube: '', linkedin: '', twitter: '', whatsapp: 'https://wa.me/919655533886' };
  settings.seo = {
    siteTitle: 'Magma Minds Academy — Computer Training & Spoken English in Tiruppur',
    metaDescription: 'No. 1 computer training and spoken English classes in Tiruppur. Job-oriented courses with certificates, affordable fees and practical training — MS Office, Tally, Python, Java, Web Development, Data Science and Digital Marketing.',
    keywords: ['computer training tiruppur', 'spoken english classes', 'tally', 'python', 'ms office', 'web development', 'data science', 'digital marketing'],
    ogImage: img('1523240795612-9a054b0db644'),
    canonicalUrl: 'http://localhost:3000',
  };
  settings.media = {
    heroImage: img('1523240795612-9a054b0db644', 1800),
    heroVideoUrl: '',
    promoVideoUrl: '',
    promoPoster: img('1524178232363-1fb2b075b655', 1600),
    campusVideoUrl: '',
    campusPoster: img('1531482615713-2afd69097998', 1600),
  };
  settings.footer = {
    aboutText: 'Magma Minds Academy is Tiruppur\u2019s institute for job-oriented software training and spoken English. Choose from MS Office, Tally, C++, Java, Python, .NET, AI, ML, DL, Web Development, Data Science, Digital Marketing, SQL and Data Analytics — plus communication skills and kids courses. Job oriented · Certificates · Affordable fees · Practical training.',
    links: [
      { label: 'Courses', url: '/courses' },
      { label: 'About Us', url: '/about' },
      { label: 'Trainers', url: '/trainers' },
      { label: 'Gallery', url: '/gallery' },
      { label: 'Events', url: '/events' },
      { label: 'FAQs', url: '/faqs' },
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms & Conditions', url: '/terms' },
    ],
  };
  settings.contact.businessHours = [
    { day: 'mon', open: '09:00', close: '19:00', closed: false },
    { day: 'tue', open: '09:00', close: '19:00', closed: false },
    { day: 'wed', open: '09:00', close: '19:00', closed: false },
    { day: 'thu', open: '09:00', close: '19:00', closed: false },
    { day: 'fri', open: '09:00', close: '19:00', closed: false },
    { day: 'sat', open: '10:00', close: '16:00', closed: false },
    { day: 'sun', closed: true },
  ];
  settings.contact.coordinates = { lat: 11.1085, lng: 77.3411 };
  settings.contact.mapEmbedUrl =
    'https://www.google.com/maps?q=Tiruppur%2C%20Tamil%20Nadu&output=embed';
  await settings.save();

  await Promise.all([
    CourseCategory.deleteMany({ isDemo: true }),
    Course.deleteMany({ isDemo: true }),
    Trainer.deleteMany({ isDemo: true }),
    Batch.deleteMany({ isDemo: true }),
    Testimonial.deleteMany({ isDemo: true }),
    Event.deleteMany({ isDemo: true }),
    GalleryItem.deleteMany({ isDemo: true }),
    Faq.deleteMany({ isDemo: true }),
    Announcement.deleteMany({ isDemo: true }),
    CourseApplication.deleteMany({ isDemo: true }),
    Enrollment.deleteMany({ isDemo: true }),
    Payment.deleteMany({ isDemo: true }),
    Enquiry.deleteMany({ isDemo: true }),
  ]);

  const categoryDocs = {};
  for (const c of categories) {
    const doc = await CourseCategory.create({ ...c, isDemo: true });
    categoryDocs[c.name] = doc;
  }
  console.log(`✓ ${Object.keys(categoryDocs).length} categories`);

  const trainerDocs = {};
  for (const t of trainerData) {
    const doc = await Trainer.create({ ...t, isDemo: true, email: `${t.name.split(' ')[0].toLowerCase()}@magmaminds.example`, availability: { days: ['mon', 'wed', 'fri'], from: '10:00', to: '17:00' } });
    trainerDocs[t.name] = doc;
  }
  console.log(`✓ ${Object.keys(trainerDocs).length} trainers`);

  const courseDocs = [];
  for (const [index, c] of courseData.entries()) {
    const { category, trainers: trainerNames, ...rest } = c;
    const doc = await Course.create({
      ...rest,
      category: categoryDocs[category]._id,
      trainers: trainerNames.map((n) => trainerDocs[n]._id),
      image: { url: img(['1517180102446-f3ece451e9d8', '1555949963-aa79dcee981c', '1581291518857-4e27b48ff24e', '1667372393119-3d4c48d07fc9', '1460925895917-afdab827c52f', '1526374965328-7f61d4dc18c5', '1563986768609-322da13575f3', '1551288049-bebda4e38f71'][index % 8]) },
      banner: { url: img('1524178232363-1fb2b075b655') },
      isPublished: true,
      status: 'published',
      isDemo: true,
      enrolledCount: 0,
      reviews: index < 6
        ? [{ name: 'Verified Learner', rating: 5, comment: 'Excellent mentor support and practical projects.', isApproved: true, role: 'Student', user: undefined }]
        : [],
    });
    courseDocs.push(doc);
    await Trainer.updateOne({ _id: trainerDocs[trainerNames[0]]._id }, { $addToSet: { courses: doc._id } });
  }
  console.log(`✓ ${courseDocs.length} courses`);

  // Batches: one upcoming + one ongoing per featured course
  const batchDocs = [];
  for (const [i, course] of courseDocs.entries()) {
    const trainer = trainerDocs[course.trainers?.length ? trainerData.find((t) => courseData[i].trainers.includes(t.name))?.name : 'Anita Raghavan'] || trainerDocs['Anita Raghavan'];
    const start = new Date();
    start.setDate(start.getDate() + 10 + i * 5);
    const end = new Date(start);
    end.setDate(end.getDate() + (course.durationWeeks || 8) * 7);
    const doc = await Batch.create({
      name: `${course.title.split(' ').slice(0, 3).join(' ')} — Weekend Batch`,
      course: course._id,
      trainer: trainer._id,
      mode: course.mode,
      startDate: start,
      endDate: end,
      days: ['sat', 'sun'],
      startTime: '10:00',
      endTime: '13:00',
      timezone: settings.locale.timezone,
      venue: course.mode === 'online' ? '' : 'Main Campus, Lab 2',
      meetingLink: course.mode === 'online' ? 'https://meet.example.com/magmaminds-batch' : '',
      capacity: 25,
      status: 'upcoming',
      fee: course.discountFee || course.fee,
      isDemo: true,
    });
    batchDocs.push(doc);
  }
  console.log(`✓ ${batchDocs.length} batches`);

  await AssessmentSeed();
  console.log('✓ testimonials, events, gallery, faqs, announcements');

  const password = 'Demo@12345';
  const demoStudents = [
    { name: 'Aditya Rao', email: 'aditya.demo@example.com' },
    { name: 'Fatima Sheikh', email: 'fatima.demo@example.com' },
    { name: 'Nikhil Verma', email: 'nikhil.demo@example.com' },
    { name: 'Ishita Bose', email: 'ishita.demo@example.com' },
    { name: 'Tanmay Gupta', email: 'tanmay.demo@example.com' },
    { name: 'Lakshmi Pillai', email: 'lakshmi.demo@example.com' },
  ];

  const studentDocs = [];
  for (const s of demoStudents) {
    let user = await User.findOne({ email: s.email });
    if (!user) {
      user = await User.create({
        name: s.name,
        email: s.email,
        password,
        role: 'student',
        isEmailVerified: true,
        phone: '+91 90000 00000',
        isDemo: true,
      });
      await StudentProfile.create({ user: user._id, qualification: 'Bachelor Degree', city: '', isDemo: true });
    }
    studentDocs.push(user);
  }

  const existingDemoApplications = await CourseApplication.countDocuments({ isDemo: true });
  if (existingDemoApplications === 0) {
    const statuses = ['new', 'under_review', 'contacted', 'approved', 'enrolled', 'rejected', 'new', 'under_review'];
    for (let i = 0; i < 8; i += 1) {
      const course = courseDocs[i % courseDocs.length];
      const batch = batchDocs[i % batchDocs.length];
      const student = studentDocs[i % studentDocs.length];
      const application = await CourseApplication.create({
        referenceNumber: CourseApplication.generateReference(),
        name: student.name,
        email: student.email,
        phone: '+91 90000 00000',
        course: course._id,
        batch: batch._id,
        mode: course.mode,
        qualification: 'Bachelor Degree',
        message: 'I am keen to join the upcoming batch. Please share the fee plan.',
        status: statuses[i],
        user: student._id,
        statusHistory: [{ status: 'new', note: 'Application submitted (demo data)', at: new Date(Date.now() - 86400000 * (8 - i)) }],
        createdAt: new Date(Date.now() - 86400000 * (8 - i)),
        isDemo: true,
      });
      if (statuses[i] === 'enrolled') {
        const enrollment = await Enrollment.create({ student: student._id, course: course._id, batch: batch._id, application: application._id, status: 'active', isDemo: true });
        await Batch.updateOne({ _id: batch._id }, { $inc: { enrolledCount: 1 } });
        await Course.updateOne({ _id: course._id }, { $inc: { enrolledCount: 1 } });
        if (i % 2 === 0) {
          await Payment.create({
            student: student._id,
            course: course._id,
            batch: batch._id,
            application: application._id,
            amount: course.discountFee || course.fee,
            currency: 'INR',
            provider: 'offline',
            status: 'paid',
            receiptNumber: Payment.generateReceipt(),
            paidAt: new Date(),
            notes: 'Demo offline payment',
            isDemo: true,
          });
        }
        enrollment.payment = undefined;
        await enrollment.save();
      }
    }
    console.log('✓ demo applications & enrollments');

    const enquirySubjects = ['Course fee structure', 'Weekend batch availability', 'Placement support details', 'Corporate training enquiry', 'Certificate validity', 'Payment instalments'];
    const enquiryTypes = ['course', 'admission', 'general', 'other', 'course', 'admission'];
    const enquiryStatuses = ['new', 'in_progress', 'resolved', 'new', 'closed', 'in_progress'];
    for (let i = 0; i < enquirySubjects.length; i += 1) {
      await Enquiry.create({
        name: demoStudents[i % demoStudents.length].name,
        email: demoStudents[i % demoStudents.length].email,
        phone: '+91 90000 00000',
        subject: enquirySubjects[i],
        message: 'Hello, I would like more information about this. Please get in touch at your earliest convenience.',
        type: enquiryTypes[i],
        status: enquiryStatuses[i],
        course: enquiryTypes[i] === 'course' ? courseDocs[i % courseDocs.length]._id : undefined,
        followUpDate: enquiryStatuses[i] === 'new' ? new Date(Date.now() + 86400000 * 2) : undefined,
        createdAt: new Date(Date.now() - 86400000 * i),
        isDemo: true,
      });
    }
    console.log('✓ demo enquiries');
  }

  await Announcement.create([
    { title: 'New weekend batches announced', message: 'Weekend batches for Python, Tally, Web Development and Spoken English are now open for enrolment. Seats are limited to 25 learners per batch.', audience: 'all', priority: 'normal', isDemo: true },
    { title: 'Campus closed for maintenance', message: 'The campus labs will be closed this Saturday for scheduled upgrades. Online classes continue as usual.', audience: 'students', priority: 'urgent', isDemo: true },
    { title: 'Placement drive next month', message: 'Hiring partners will visit campus next month for interviews. Update your resume in your student profile.', audience: 'students', priority: 'normal', isDemo: true },
  ]);

  console.log(`\n✓ Demo data seeded (all documents flagged isDemo: true).`);
  console.log(`  Demo student logins: aditya.demo@example.com … lakshmi.demo@example.com / ${password}`);
  if (!env.SUPER_ADMIN_EMAIL) {
    console.log('  Tip: create an admin with  npm run seed:superadmin  (requires SUPER_ADMIN_* env vars).');
  }
}

async function AssessmentSeed() {
  const courseDocs = await Course.find({ isDemo: true });
  const byTitle = Object.fromEntries(courseDocs.map((c) => [c.title, c._id]));
  for (const t of testimonialData) {
    await Testimonial.create({ ...t, course: byTitle[t.course], isApproved: true, isFeatured: true, isDemo: true });
  }
  for (const e of eventData) {
    const start = new Date();
    start.setDate(start.getDate() + e.startDate);
    await Event.create({ ...e, startDate: start, isPublished: true, isDemo: true, image: { url: img('1540575467063-178a50c2df87') } });
  }
  for (const g of galleryData) {
    await GalleryItem.create({ ...g, image: { url: g.image }, isActive: true, isDemo: true });
  }
  for (const f of faqData) {
    await Faq.create({ ...f, isActive: true, isDemo: true });
  }
}

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDemo();
    await disconnectDB();
    process.exit(0);
  })().catch(async (err) => {
    console.error('✗ Demo seeder failed:', err.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  });
}

module.exports = { seedDemo };
