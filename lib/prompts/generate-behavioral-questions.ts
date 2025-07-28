export const BEHAVIORAL_SYSTEM_PROMPT =
  "You are an expert behavioral interviewer specialized in designing STAR method questions to help hiring managers assess candidates' past experiences, competencies, and behavioral patterns. You always respond with valid JSON format only.";

export const generateBehavioralQuestionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
}) => `Generate behavioral interview questions based on the following requirements:

Interview Title: ${body.name}
Interview Objective: ${body.objective}
Number of questions to be generated: ${body.number}

BEHAVIORAL INTERVIEW GUIDELINES:
- All questions must follow the STAR method framework (Situation, Task, Action, Result)
- Focus on past experiences and specific examples rather than hypothetical scenarios
- Questions should start with phrases like "Tell me about a time when...", "Describe a situation where...", "Give me an example of..."
- Encourage detailed responses that demonstrate competencies and behavioral patterns
- Balance questions across different behavioral competency areas
- Make questions relevant to the role and experience level specified

COMPETENCY AREAS TO COVER:
- Leadership and influence
- Problem-solving and decision-making
- Communication and collaboration
- Adaptability and learning agility
- Conflict resolution and negotiation
- Time management and prioritization
- Initiative and ownership
- Teamwork and relationship building
- Handling pressure and stress management
- Customer focus and service orientation
- Innovation and creativity
- Integrity and ethical behavior

QUESTION QUALITY REQUIREMENTS:
- Each question should be concise and clear (under 40 words)
- Avoid leading questions or those with obvious "right" answers
- Ensure questions are open-ended and encourage storytelling
- Make questions specific enough to elicit detailed STAR responses
- Consider the experience level when crafting questions

Context for question generation:
${body.context}

Requirements for output:
1. Generate a 50-word or less second-person description for the 'description' field
   - Explain that this is a behavioral interview focusing on past experiences
   - Mention the STAR method framework
   - Make it clear and understandable for the interview respondent

2. Create exactly ${body.number} behavioral questions in the 'questions' field as an array of objects
   - Each object should have a 'question' key with the behavioral question text
   - Questions must encourage sharing specific past experiences
   - Ensure variety across different behavioral competencies

IMPORTANT: You must respond with ONLY a valid JSON object containing exactly these two keys: 'questions' and 'description'. No additional text, explanations, or formatting.

Example format:
{
  "description": "This behavioral interview focuses on your past experiences and how you've handled various workplace situations. Please use the STAR method (Situation, Task, Action, Result) when responding to share specific examples.",
  "questions": [
    {"question": "Tell me about a time when you had to lead a team through a challenging project."},
    {"question": "Describe a situation where you had to adapt quickly to unexpected changes."}
  ]
}`;