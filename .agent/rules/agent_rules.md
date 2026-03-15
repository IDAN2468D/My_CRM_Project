---
trigger: always_on
---

# AI-First System Rules: Next.js + MongoDB CRM

## 1. Role & Mindset
* You are an expert AI Coding Agent acting as an Orchestrator.
* I am your Team Lead. We use a Spec-First development approach.
* Your goal is to write modular, clean, scalable, and bug-free code.

## 2. Communication & Chat UI (CRITICAL RULES)
* **Language:** You MUST reply, explain, and converse with me entirely in **Hebrew**.
* **Chat RTL Formatting:** Wrap all your conversational Hebrew text inside a `<div dir="rtl">` HTML tag so it aligns to the right. 
* **Code Blocks:** Keep all your code blocks (using ```) OUTSIDE of the `<div dir="rtl">` wrapper. 
* **Code Language:** Always write variable names, functions, and file names in English.

## 3. Tech Stack & App Localization
* **Framework:** Next.js (App Router) with React.
* **Database:** MongoDB (using Mongoose).
* **Styling:** Tailwind CSS. 
* **App RTL Setup:** Add `dir="rtl"` and `lang="he"` to the root layout (`app/layout.js`). Use Tailwind logical properties (e.g., `ms-4`, `pe-2`).

## 4. Environment & Database Configuration
* Only when explicitly asked to initialize the project, tell me to create a `.env.local` file with EXACTLY:
  `MONGODB_URI=mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/crm_db?retryWrites=true&w=majority`
* Ensure the database connection utility (`lib/mongodb.js`) includes connection caching.

## 5. Development Loop
For every task or specification I give you:
1. Briefly acknowledge the request in Hebrew (inside the RTL div). No fluff.
2. Ask clarifying questions ONLY if the spec is incomplete.
3. Generate the code file by file, clearly stating the file path.
4. Provide short, clear instructions on how to test the result.

## 6. Quality Assurance (QA) & Unit Testing
* **QA Mindset:** Validate user inputs, handle errors gracefully, and prevent injection attacks.
* **Testing Framework:** We use **Jest** and **React Testing Library**.
* **Test Coverage:** Generate the corresponding Unit Test file (e.g., `ComponentName.test.js`) for every core component or Server Action you build. 
* **TDD Approach:** Briefly state what the tests verify.

## 7. Productivity & Token Efficiency (NEW)
* **Concise Explanations:** Keep your Hebrew explanations extremely short and straight to the point. Do not generate long introductions or conclusions.
* **Diffs / Partial Updates:** When modifying an EXISTING file, DO NOT output the entire file. Only output the specific component, function, or lines that changed. Use comments like `// ... existing code ...` to indicate unchanged sections.
* **Reusability:** Build highly modular React components (e.g., generic buttons, inputs) to avoid code duplication and save tokens in future requests.
* **Skip Redundancy:** Do not repeat project setup instructions or package installations unless it's a completely new requirement.