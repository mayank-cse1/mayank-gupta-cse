import React, { useState, useEffect } from "react";
import styled from "styled-components";

const API_KEY = "AIzaSyA19uCjIjOX3Wsjlan6ZT-R9cBi05esgjw"; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const SYSTEM_PROMPT = `
You are an AI assistant that provides responses only about Mayank Gupta. 

If a user asks about personal details, non-career topics, or unrelated subjects, politely decline by saying: 
"I'm here to answer questions about Mayank Gupta's education, experience, and career aspirations. Let me know how I can help!"

Here’s Mayank Gupta’s professional background:

**Education:**  
- B.Tech in Computer Science and Engineering (2020-2024) from Vellore Institute of Technology, Chennai.  
- Higher Secondary (92.60%) from Ahlcon Public School, New Delhi (2018-2020).  

**Experience:**  
- **Software Development Engineer (SDE) at John Deere** (June 2024 – Present)  
  - Developed "DeereVision AI Workspace," integrating LLaMA 3.2 and Neo4j & Chroma DB.  
  - Built modular Python solutions with LangChain, Terraform, Docker, and GitHub Actions on AWS.  

- **SDE Intern at Swiggy** (Sept 2023 – June 2024)  
  - Developed 7 full-fledged payment dashboards using Elasticsearch & Retool.  

- **SDE Intern at Dewiride Technologies** (July 2022 – Dec 2022)  
  - Worked on 15+ client-specific projects using Python, C#, and Microsoft Bot Framework.  

- **SDE Intern at LG Electronics** (May 2022 – July 2022)  
  - Built a Lunch Booking Web App used by 1000+ employees with C# and ASP.NET.  

**Projects:**  
- **DEV – Virtual Banking Assistant** (Finalist, Bank of Baroda Hackathon)  
- **Face Track AI** (Finalist, Tamil Nadu Police Hackathon)  
- **Hunger Free Society** (2nd Prize, IEEE AISYWAL Competition)  
- **Go-To-Market Merchandiser Bot** (Automated Merchandiser Reporting)  

**Skills:**  
- **Programming:** Python, C++, Java, C#  
- **Frameworks:** Ollama, LangChain, FastAPI, Flask, ASP.NET, Django  
- **Databases:** MySQL, Cosmos DB, Neo4j, ChromaDB, FAISS  
- **Cloud:** AWS, GCP, Azure  

When answering questions, stay concise and professional. If the question is unclear, ask for clarification. If the topic is outside Mayank Gupta’s career scope, politely decline to answer.
`;
const TEMPLATE_QUESTION_PROMPT = `
You are Mayank Gupta's virtual assistant. Your task is to generate a relevant follow-up questions based on the given user question and the bot's response.  

### Instructions:  
- The questions should be contextually relevant to the conversation.  
- Ensure they are well-formed, meaningful, and logically connected to the topic.  
- If the input is unclear or unrelated to Mayank Gupta's career, return the default list:  ["Hi! How can you help me?", "What knowledge do you have about Mayank?"].  

`;
const defaultTemplateQuestions = [
  "Hi! How can you help me",
  "What knowledge do you have about Mayank"
];

const templateQuestions = [
  "Hi! How can you help me",
  "What knowledge do you have about Mayank"
];

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
`;

const ChatWindow = styled.div`
  width: 300px;
  height: 450px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: ${(props) => (props.visible ? "flex" : "none")};
  flex-direction: column;
  position: fixed;
  bottom: 80px;
  right: 20px;
`;

const ChatHeader = styled.div`
  background: #007bff;
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-size: 14px;
  background: #f9f9f9;
`;

const TemplateButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px;
  background: #f1f1f1;
`;

const TemplateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 5px;
  font-size: 12px;
  border-radius: 5px;
  cursor: pointer;
`;

const ChatInputContainer = styled.div`
  display: flex;
  border-top: 1px solid #ddd;
  padding: 5px;
  background: #fff;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 8px;
  border: none;
  outline: none;
`;

const SendButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
`;

const Chatbot = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [templateQuestions, setTemplateQuestions] = useState(defaultTemplateQuestions);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setMessages(storedMessages);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);
  const isValidPythonString = (input) => {
    try {
      JSON.parse(JSON.stringify(input));
      return true;
    } catch (error) {
      return false;
    }
  };
  const handleSendMessage = async (input) => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    
    const botResponse = await getBotResponse(input);
    if (!botResponse.includes("I'm not sure", "help")) {
      fetchTemplateQuestions(input, botResponse);
  } else {
      setTemplateQuestions(defaultTemplateQuestions);
  }
    setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
  };

  const handleTemplateClick = (question) => {
    handleSendMessage(question);
  };
  const fetchTemplateQuestions = async (input,botResponse) => {
    if (!isValidPythonString(input)) {
      setTemplateQuestions(defaultTemplateQuestions);
      return;
    }
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${TEMPLATE_QUESTION_PROMPT} \n Generate 1 relevant questions based on: ${input} and bot response :${botResponse}` }] }],
        }),
      });
      const data = await response.json();
      const questions = data?.candidates?.[0]?.content?.parts?.map(part => part.text) || defaultTemplateQuestions;
      setTemplateQuestions(questions);
    } catch (error) {
      console.error("Error fetching template questions:", error);
      setTemplateQuestions(defaultTemplateQuestions);
    }
  };
  const getBotResponse = async (input) => {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${input}\nAI:` }] }],
        }),
      });
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure, but I'm learning!";
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Oops! Something went wrong.";
    }
  };

  return (
    <ChatContainer>
      <ChatButton onClick={() => setVisible(!visible)}>💬</ChatButton>
      <ChatWindow visible={visible}>
        <ChatHeader>
          <span>Chatbot</span>
          <CloseButton onClick={() => setVisible(false)}>&times;</CloseButton>
        </ChatHeader>
        <ChatBody>
          {messages.map((msg, index) => (
            <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
              <p
                style={{
                  margin: "5px 0",
                  padding: "5px",
                  background: msg.sender === "user" ? "#007bff" : "#ddd",
                  color: msg.sender === "user" ? "white" : "black",
                  borderRadius: "5px",
                  display: "inline-block",
                }}
              >
                {msg.text}
              </p>
            </div>
          ))}
        </ChatBody>
        <TemplateButtons>
          {templateQuestions.map((question, index) => (
            <TemplateButton key={index} onClick={() => handleTemplateClick(question)}>
              {question}
            </TemplateButton>
          ))}
        </TemplateButtons>
        <ChatInputContainer>
          <ChatInput id="chat-input" type="text" placeholder="Type a message..." onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e.target.value)} />
          <SendButton onClick={() => handleSendMessage(document.getElementById("chat-input").value)}>➤</SendButton>
        </ChatInputContainer>
      </ChatWindow>
    </ChatContainer>
  );
};

export default Chatbot;
