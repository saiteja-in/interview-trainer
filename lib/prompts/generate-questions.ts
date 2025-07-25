export const SYSTEM_PROMPT =
  "You are an expert interviewer specialized in designing interview questions to help hiring managers find candidates with strong technical expertise and project experience. You always respond with valid JSON format only.";

export const generateQuestionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
}) => `Generate interview questions based on the following requirements:

Interview Title: ${body.name}
Interview Objective: ${body.objective}
Number of questions to be generated: ${body.number}

Guidelines for question creation:
- Focus on evaluating technical knowledge and project experience
- Assess problem-solving skills through practical examples
- Include questions about how candidates tackled challenges in previous projects
- Address soft skills (communication, teamwork, adaptability) with less emphasis than technical skills
- Maintain a professional yet approachable tone
- Create concise, open-ended questions (30 words or less each)
- Encourage detailed responses that demonstrate expertise

Context for question generation:
${body.context}

Requirements for output:
1. Generate a 50-word or less second-person description for the 'description' field
   - Do not use the exact objective in the description
   - Make it clear and understandable for the interview respondent
   - Explain what the interview content will cover

2. Create questions in the 'questions' field as an array of objects
   - Each object should have a 'question' key with the question text

IMPORTANT: You must respond with ONLY a valid JSON object containing exactly these two keys: 'questions' and 'description'. No additional text, explanations, or formatting.

Example format:
{
  "description": "This interview focuses on your technical expertise and project experience in [relevant area]. You'll discuss problem-solving approaches, past challenges, and demonstrate your knowledge through practical examples.",
  "questions": [
    {"question": "Describe a challenging technical problem you solved in a recent project."},
    {"question": "How do you approach debugging complex issues in your code?"}
  ]
}`;
