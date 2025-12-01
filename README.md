# ITA602 - Fade Station AI Receptionist

**Making barbershops better with an AI that handles customer service and bookings.**

---

## Project Goal

The main goal of the Fade Station project is to build a smart AI assistant that will change how barbershops deal with customers. The project aims to automate booking appointments, take customer requests by text or call (using Twilio), and send reminders. This work will help lower the number of missed appointments and make the shop run more smoothly.

---

## Technologies Used

This project uses these core tools:

- **Frontend (User Interface):** React
- **Design/Look:** Tailwind CSS
- **Backend (Server Code):** Python
- **AI System:** Google Gemini
- **Database/Storage:** Supabase
- **Communication:** Twilio API

---

## Key Features

The Fade Station AI Receptionist has these important features:

- **Smart Chat AI:** A program that can manage booking requests, cancellations, and questions using voice and text. The AI uses Gemini AI to figure out what the customer wants and gives good, helpful answers.
- **Works Across Many Channels:** The system connects to SMS, phone call via Twillio phone number, or Web Chat. This lets customers talk to the barbershop in the easiest way for them.
- **Manager's Live Dashboard:** A special page that shows shop owners real-time data on bookings and staff availability. This data helps owners make smart choices about their staff and services.

---

## Team

Project Manager - Raphael Bernard Bonifacio
QA and Tester - Nijesh Manandhar  
Developer (Front-end) - Minh Quoc Vo  
Developer (Back-end) - Hien Pham

---

## Setup Instructions

To get this project running locally, you must set up the Frontend (React) and the Backend (Python) parts.

**Install all needed packages:**
`bash
    npm install
    `

Start the program:
`bash
    npm run start
    `

### 1. Configuration

You must create a file named `.env` in the main project folder. Add the required information for the SUPABASE service:
REACT_APP_SUPABASE_URL=REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=REACT_APP_SUPABASE_ANON_KEY
