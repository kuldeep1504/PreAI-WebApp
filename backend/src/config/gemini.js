const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API Client
let genAI = null;
let isMockMode = false;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'replace_with_your_gemini_api_key' || apiKey.trim() === '') {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not configured or uses placeholder. Running in Mock/Simulation Mode.');
  isMockMode = true;
} else {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('🔌 Gemini AI service initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini AI, falling back to mock mode:', err.message);
    isMockMode = true;
  }
}

// Helper to query Gemini with system instructions and JSON structure forcing
async function queryGemini(prompt, systemInstruction = '') {
  if (isMockMode) return null;
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const fullPrompt = systemInstruction 
      ? `${systemInstruction}\n\nUser Request: ${prompt}`
      : prompt;
      
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('💥 Gemini API Query Error:', err.message);
    return null; // Force fallback
  }
}

// 1. Generate Career Roadmap
async function generateRoadmap(role, company, skillLevel, experience, language, weakAreas) {
  const systemInstruction = `You are a career development coach and technical recruiter. Generate a structured, personalized 7-day preparation roadmap. You must respond ONLY with a valid JSON object matching this schema:
  {
    "targetRole": "string",
    "targetCompany": "string",
    "days": [
      {
        "day": 1,
        "title": "string",
        "topics": ["string"],
        "practiceQuestions": ["string"],
        "studyResources": ["string"]
      }
    ],
    "generalTips": ["string"],
    "companyPattern": "string"
  }`;

  const prompt = `Generate a preparation roadmap for a ${skillLevel} level candidate targeting a ${role} role at ${company}. Experience level is ${experience} years, preferred language is ${language}, and weak areas are: ${weakAreas}.`;

  const response = await queryGemini(prompt, systemInstruction);
  if (response) return response;

  // Fallback Mock Data
  return {
    targetRole: role,
    targetCompany: company,
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Mastering ${i === 0 ? 'Core Foundations' : i === 1 ? 'Data Structures' : i === 2 ? 'Algorithms' : i === 3 ? 'System Design' : i === 4 ? 'Behavioral & STAR' : i === 5 ? 'Company Specific Patterns' : 'Final Mock Prep'}`,
      topics: [
        `Reviewing target topics for ${role} in ${language}`,
        `Strengthening understanding of: ${weakAreas || 'Core concepts'}`,
        `Familiarizing with typical interview patterns at ${company}`
      ],
      practiceQuestions: [
        `Explain memory management or language features of ${language}.`,
        `Design a scalable application handling high throughput for ${company}.`,
        `Describe a time you solved a complex bug in ${language}.`
      ],
      studyResources: [
        `LeetCode - ${company} Top Questions Tag`,
        `System Design Primer on Github`,
        `STAR Method Guide for Behavioral Rounds`
      ]
    })),
    generalTips: [
      `Practice speaking your thoughts out loud while writing code.`,
      `Focus heavily on complexity analysis: explain why you chose an $O(N)$ solution over $O(N^2)$.`,
      `In behavioral questions, use the STAR format: Situation, Task, Action, Result.`
    ],
    companyPattern: `At ${company}, candidates are assessed heavily on problem solving speed, architectural clarity in ${role}, and alignment with leadership principles.`
  };
}

// 2. Generate Interview Questions
async function generateInterviewQuestions(role, company, roundType, count = 5) {
  const systemInstruction = `You are a lead technical and HR interviewer. Generate a list of highly realistic interview questions. Respond ONLY with a valid JSON object matching this schema:
  {
    "questions": [
      {
        "id": "string (unique code, e.g. q1)",
        "question": "string",
        "category": "Technical | HR | Behavioral | Coding | Aptitude",
        "difficulty": "Easy | Medium | Hard",
        "hints": ["string"],
        "expectedPoints": ["string"]
      }
    ]
  }`;

  const prompt = `Generate ${count} questions for a ${role} position at ${company} for a "${roundType}" interview round. Make sure to generate highly tailored questions.`;

  const response = await queryGemini(prompt, systemInstruction);
  if (response) return response.questions;

  // Fallback Mock Data
  const defaultQuestions = {
    Technical: [
      {
        id: "tech_1",
        question: `How does execution context and asynchronous behavior work in ${role.includes('Frontend') ? 'JavaScript' : 'your primary stack'}? Explain Event Loop or multithreading.`,
        category: "Technical",
        difficulty: "Medium",
        hints: ["Think about call stack, microtask queues, and callback queues.", "Mention non-blocking I/O."],
        expectedPoints: ["Event Loop execution order", "Difference between promise callbacks and timeouts", "Single-threaded vs multi-threaded paradigms"]
      },
      {
        id: "tech_2",
        question: `Explain how you would optimize a slow database query in a production environment at ${company}.`,
        category: "Technical",
        difficulty: "Hard",
        hints: ["Consider indexing, execution plans, caching, and connection pooling."],
        expectedPoints: ["Analyzing with EXPLAIN", "Creating compound indices", "Using redis for caching", "N+1 query resolution"]
      }
    ],
    HR: [
      {
        id: "hr_1",
        question: `Why do you want to join ${company}, and what makes you the best fit for this ${role} role?`,
        category: "HR",
        difficulty: "Easy",
        hints: ["Mention specific company core values, latest products, or work culture.", "Align your past accomplishments."],
        expectedPoints: ["Alignment with core culture", "Clear motivation", "Mentioning specific team or product area"]
      },
      {
        id: "hr_2",
        question: `Describe a situation where you had a major disagreement with a team lead or colleague. How did you resolve it?`,
        category: "Behavioral",
        difficulty: "Medium",
        hints: ["Use the STAR method.", "Emphasize collaboration, listening, and project success over ego."],
        expectedPoints: ["Professional conflict resolution", "Active listening and compromise", "Positive outcome for the project"]
      }
    ],
    Behavioral: [
      {
        id: "beh_1",
        question: `Tell me about a time you failed to meet a crucial deadline. What were the repercussions, and what did you learn?`,
        category: "Behavioral",
        difficulty: "Medium",
        hints: ["Be honest but focus on the accountability, remediation, and long-term learnings."],
        expectedPoints: ["Ownership of failure", "Proactive communication", "Processes implemented to avoid recurrence"]
      }
    ],
    Coding: [
      {
        id: "code_1",
        question: `Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. Optimize for time complexity.`,
        category: "Coding",
        difficulty: "Easy",
        hints: ["Can you do this in one pass using a hash map?", "Think about storing the complement."],
        expectedPoints: ["One pass hash map approach", "Time complexity O(N)", "Space complexity O(N)"]
      },
      {
        id: "code_2",
        question: `Given a string 's', find the length of the longest substring without repeating characters.`,
        category: "Coding",
        difficulty: "Medium",
        hints: ["Use a sliding window approach with two pointers.", "Store character frequencies or last seen indices."],
        expectedPoints: ["Sliding window with left/right pointers", "Time complexity O(N)", "Space complexity O(min(M, N))"]
      }
    ]
  };

  return defaultQuestions[roundType] || [...defaultQuestions.Technical, ...defaultQuestions.HR];
}

// 3. Evaluate User Answer (Voice/Text feedback per question)
async function evaluateAnswer(question, answer, role, company) {
  const systemInstruction = `You are a strict, constructive technical and communication evaluator. Evaluate the user's answer. Respond ONLY with a valid JSON object matching this schema:
  {
    "technicalAccuracy": 0-100 (number),
    "communicationScore": 0-100 (number),
    "confidenceIndicator": "Low | Medium | High",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "suggestedAnswer": "string (the perfect answer)",
    "fillerWordsDetected": ["string"],
    "generalFeedback": "string"
  }`;

  const prompt = `Question: "${question}"\nUser Answer: "${answer}"\nContext: Evaluating for a ${role} position at ${company}.`;

  const response = await queryGemini(prompt, systemInstruction);
  if (response) return response;

  // Fallback Mock Evaluation
  const textLength = (answer || '').length;
  const isTechnical = question.toLowerCase().includes('explain') || question.toLowerCase().includes('how') || question.toLowerCase().includes('what');

  let techScore = textLength > 120 ? 85 : textLength > 50 ? 65 : 40;
  let commScore = textLength > 100 ? 90 : textLength > 40 ? 70 : 45;
  if (!answer || answer.trim() === '') {
    techScore = 10;
    commScore = 10;
  }

  return {
    technicalAccuracy: techScore,
    communicationScore: commScore,
    confidenceIndicator: textLength > 80 ? "High" : textLength > 30 ? "Medium" : "Low",
    strengths: [
      textLength > 60 ? "Demonstrated basic understanding of the question core." : "Attempted response directly.",
      "Good structure of key ideas."
    ],
    weaknesses: [
      textLength < 80 ? "The response was brief. Try to elaborate on technical specifications or use a concrete project example." : "Could structure the explanation with clear logical steps.",
      "Ensure clear architectural details are verbalized."
    ],
    suggestedAnswer: `For this question, an ideal response should define the core concept clearly, give a concrete production example (e.g., how you optimized database latency at a past role or structured async state), and outline why it is important for scalability at ${company}.`,
    fillerWordsDetected: textLength > 50 ? ["basically", "like"] : ["uh", "um"],
    generalFeedback: "Your answer has a solid direction. To take it to the next level, structure your thoughts with the 'STAR' framework or provide specific tech stack terminology to show expertise."
  };
}

// 4. Code Review & Complexity Analysis
async function reviewCode(language, code, question) {
  const systemInstruction = `You are an elite principal engineer and code reviewer. Analyze the provided code snippet. Respond ONLY with a valid JSON object matching this schema:
  {
    "syntaxValid": true | false,
    "timeComplexity": "string (e.g. O(N))",
    "spaceComplexity": "string (e.g. O(1))",
    "score": 0-100 (number),
    "bugsFound": ["string"],
    "reviewDetails": "string (feedback)",
    "optimizedCode": "string (improved code snippet)"
  }`;

  const prompt = `Language: ${language}\nQuestion: "${question}"\nCode:\n\`\`\`\n${code}\n\`\`\``;

  const response = await queryGemini(prompt, systemInstruction);
  if (response) return response;

  // Fallback Mock Code Review
  const hasLoop = code.includes('for') || code.includes('while') || code.includes('.forEach') || code.includes('.map');
  const hasMap = code.includes('Map') || code.includes('Set') || code.includes('{}') || code.includes('dict');

  return {
    syntaxValid: true,
    timeComplexity: hasLoop ? (hasMap ? "O(N)" : "O(N^2)") : "O(1)",
    spaceComplexity: hasMap ? "O(N)" : "O(1)",
    score: code.length > 50 ? 88 : 45,
    bugsFound: code.length < 30 ? ["Code is too short or incomplete to cover edge cases."] : [],
    reviewDetails: "The implementation works, but there is room for optimization. Ensure that you account for boundary limits (e.g., null values, empty arrays) and think about micro-optimizations depending on the language's native structures.",
    optimizedCode: `// Optimized implementation in ${language}\nfunction solution(input) {\n  // Using hash-map to solve in O(N) time complexity\n  const lookup = new Map();\n  for (let i = 0; i < input.length; i++) {\n    // Optimal computation logic\n  }\n  return null;\n}`
  };
}

// 5. Resume Analyzer & ATS Score Calculator
async function analyzeResume(resumeText, targetCompany, targetRole) {
  const systemInstruction = `You are an executive recruiter and expert ATS (Applicant Tracking System) grader. Evaluate the resume text against the target role and target company. Respond ONLY with a valid JSON object matching this schema:
  {
    "atsScore": 0-100 (number),
    "matchedSkills": ["string"],
    "missingSkills": ["string"],
    "formattingScore": 0-100 (number),
    "suggestions": ["string"],
    "atsFeedback": "string"
  }`;

  const prompt = `Target Company: ${targetCompany}\nTarget Role: ${targetRole}\nResume Text:\n${resumeText}`;

  const response = await queryGemini(prompt, systemInstruction);
  if (response) return response;

  // Fallback Mock Resume Analysis
  const text = resumeText.toLowerCase();
  const score = text.includes('react') || text.includes('node') || text.includes('python') || text.includes('java') ? 82 : 55;

  return {
    atsScore: score,
    matchedSkills: ["Software Engineering", "Full-Stack Development", "Version Control (Git)", "Database Management"].filter(() => text.length > 100),
    missingSkills: [`System Design in ${targetRole}`, `Cloud Infrastructure (AWS/GCP)`, `Microservices Architecture`, `CI/CD Automation pipelines`],
    formattingScore: 90,
    suggestions: [
      `Quantify your achievements! Instead of 'built websites', write 'increased load performance by 35% through image optimizations'.`,
      `Add cloud deployment experience (AWS, Docker, Kubernetes) which is highly valued at ${targetCompany}.`,
      `Incorporate keywords related directly to the job description of ${targetRole}.`
    ],
    atsFeedback: `Your resume shows excellent technical foundations, but to pass the ${targetCompany} initial automatic ATS screening for ${targetRole}, you must clearly highlight architectural ownership, production impact, and scale metrics.`
  };
}

module.exports = {
  generateRoadmap,
  generateInterviewQuestions,
  evaluateAnswer,
  reviewCode,
  analyzeResume,
  isMockMode
};
