# Suraag AI: Forensic Intelligence Platform

**Suraag AI** is a state-of-the-art, mathematically rigorous forensic intelligence and reconstruction platform. Designed for law enforcement, intelligence agencies, and elite investigators, Suraag AI fuses fragmented evidence into verifiable, multi-dimensional intelligence dossiers.

Featuring a cinematic **Crime Noir + Futuristic Intelligence** interface, the platform offers deep tactical analysis, 3D ballistics reconstruction, and Explainable AI (XAI) to ensure that every deduction is transparent, mathematically sound, and courtroom-ready.

---

## 🎯 Core Capabilities

- **Bayesian Sensor Fusion:** Aggregates and correlates diverse data streams (CCTV, audio, ballistics, witness statements) into high-probability scenarios.
- **3D Crime Scene Reconstruction:** Line-of-sight raycasting and ballistic trajectory physics engines validate or refute witness statements in real-time.
- **Explainable AI (XAI) & Contradiction Matrices:** AI doesn't just give answers; it provides the exact mathematical reasoning, highlighting contradictions and degrading the credibility of conflicting data sources.
- **Sovereign Dossier Generation:** One-click export of Top Secret, courtroom-ready PDF investigation reports.

---

## ⚙️ How It Works (System Architecture)

Suraag AI operates on a multi-stage intelligence pipeline. Raw data enters the system, gets processed by physics and behavioral engines, and is ultimately compiled into actionable intelligence.

```mermaid
graph TD
    %% Styling
    classDef input fill:#1A1A1A,stroke:#424242,stroke-width:2px,color:#F5F5F5;
    classDef engine fill:#2D2D2D,stroke:#E53935,stroke-width:2px,color:#F5F5F5;
    classDef output fill:#1A1A1A,stroke:#4CAF50,stroke-width:2px,color:#F5F5F5;
    classDef database fill:#0C0C0C,stroke:#424242,stroke-width:2px,color:#A0A0A0;

    %% Nodes
    A1[CCTV & Video Feeds]:::input
    A2[Ballistics & Physics Data]:::input
    A3[Witness Statements]:::input
    A4[Digital Forensics]:::input

    B(Suraag AI Ingestion Core):::database

    C1[3D Reconstruction Engine]:::engine
    C2[Timeline & Contradiction Matrix]:::engine
    C3[Bayesian Fusion Network]:::engine

    D{Explainable AI Reasoning}:::engine

    E1[Tactical Probability Scenarios]:::output
    E2[Suspect Risk Dossiers]:::output
    E3[Court-Ready Investigation Report]:::output

    %% Connections
    A1 --> B
    A2 --> B
    A3 --> B
    A4 --> B

    B --> C1
    B --> C2
    B --> C3

    C1 --> D
    C2 --> D
    C3 --> D

    D --> E1
    D --> E2
    D --> E3
```

---

## 🔍 The Triangulation Process

When analyzing a specific event (e.g., a ballistic trajectory or missing evidence), Suraag AI uses geometric and physical refutation to separate truth from fiction.

```mermaid
sequenceDiagram
    participant W as Witness Statement
    participant S as Suraag 3D Engine
    participant A as AI Contradiction Matrix
    participant R as Final Report

    W->>S: "I saw the suspect from the North Doorway."
    note right of S: Raycasting & Line-of-Sight Check
    S-->>A: [Result] 100% Occlusion by Server Rack #4
    note right of A: Witness credibility downgraded to 42.5%
    A->>R: Geometric Refutation logged in Dossier
```

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Custom "Crime Noir" Theme with glassmorphism & matte styling)
- **Icons & Graphics:** Lucide React
- **Architecture:** Client-side mock architecture ready for backend API integration (Node.js/Python)

---

## 💻 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/Suraag-AI.git
   cd Suraag-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the Dashboard**
   Open your browser and navigate to `http://localhost:5173`.
