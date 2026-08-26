# Suraag AI: Gap Analysis & Execution Plan

Based on the required objective to develop an AI-powered system for criminal network analysis, the following outlines the features currently missing from the Suraag AI platform and a step-by-step execution plan to implement them.

## 1. What's Not Present (Gap Analysis)

While Suraag AI currently excels in physics-based 3D reconstruction, Bayesian sensor fusion, and geometric contradiction matrices, it lacks the macro-level network analysis capabilities required by the new prompt.

**Missing Data Sources:**
*   **Current:** CCTV, Ballistics, physical witness statements, device digital forensics.
*   **Missing:** Unstructured FIRs/Police Reports, Call Detail Records (CDRs), Financial transaction records, Social media intelligence (OSINT).

**Missing Features:**
1.  **Named Entity Recognition (NER) & NLP Pipeline:** Automated extraction of people, locations, vehicles, phone numbers, and organizations from unstructured text.
2.  **Knowledge Graph & Relationship Mapping:** Visual node-based mapping of how entities (suspects, banks, vehicles) are interconnected.
3.  **Social Network Analysis (Key Influencers):** Algorithmic identification of kingpins, intermediaries, and influential figures using graph math (centrality).
4.  **Behavioral Anomaly Detection:** Finding suspicious financial flows or communication spikes that aren't tied to physical 3D scene contradictions.

---

## 2. Execution Plan

### Phase 1: Advanced Data Ingestion Pipeline
**Goal:** Collect and normalize structured (CSV) and unstructured (PDF/Image) data.
*   **Step 1:** Develop OCR and Document Parsers (using tools like Tesseract or AWS Textract) to digitize scanned FIRs and police reports.
*   **Step 2:** Build structured data loaders for Call Detail Records (CDRs) and Financial Transactions (handling CSV/Excel formats).
*   **Step 3:** Integrate OSINT APIs (e.g., Twitter/X API, public record scrapers) for social media intelligence.
*   **Step 4:** Standardize all incoming data into a unified, encrypted schema within the backend.

### Phase 2: NLP & Entity Extraction (NER)
**Goal:** Extract important entities (people, locations, vehicles, phones, orgs).
*   **Step 1:** Integrate an NLP engine (e.g., spaCy, HuggingFace Transformers).
*   **Step 2:** Fine-tune the NLP models on law-enforcement specific datasets to recognize domain-specific jargon (e.g., penal codes, local address formats).
*   **Step 3:** Implement a pipeline that scans ingested text, tags entities, and resolves aliases (e.g., recognizing that "John D." and "J. Doe" in the same context refer to the same person).
*   **Step 4:** Store extracted entities into a Graph Database compatible format.

### Phase 3: Relationship Mapping & Knowledge Graphs
**Goal:** Build relationship maps showing how different entities are connected.
*   **Step 1:** Deploy a Graph Database (e.g., Neo4j, Amazon Neptune) to store entities as "Nodes" and relationships as "Edges".
*   **Step 2:** Write logic to automatically link nodes (e.g., linking two Person nodes if they frequently appear in the same CDR logs).
*   **Step 3:** Implement a Frontend Graph Visualization using libraries like Cytoscape.js or React Flow to allow investigators to drag, drop, and explore the network visually.

### Phase 4: Social Network Analysis (Key Influencers)
**Goal:** Identify key individuals who play influential roles within networks.
*   **Step 1:** Run Graph Analytics algorithms natively on the graph database.
*   **Step 2:** Implement **Betweenness Centrality** to find intermediaries (people connecting two isolated criminal cells).
*   **Step 3:** Implement **Degree Centrality** to find individuals with the highest number of direct connections (potential kingpins).
*   **Step 4:** Highlight these high-value targets visually in the dashboard via color-coding and risk scores.

### Phase 5: Anomaly & Suspicious Pattern Detection
**Goal:** Detect suspicious patterns and unusual activities.
*   **Step 1:** Deploy ML Anomaly Detection models (e.g., Isolation Forests, Graph Neural Networks) over the financial and communication data.
*   **Step 2:** Set up heuristic rules for known criminal topologies (e.g., "Smurfing" in financial transactions or "Burner phone" activation patterns).
*   **Step 3:** Alert the investigator in real-time when the system detects a cluster of activities that statistically deviate from the norm, feeding this back into Suraag's Explainable AI (XAI) engine for transparency.
