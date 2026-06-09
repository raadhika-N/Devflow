About
-
DevFlow is a full-stack project management platform that enables teams to manage projects, track tasks, collaborate through comments, and monitor progress through activity feeds. The platform also integrates AI-powered project intelligence using Retrieval-Augmented Generation (RAG), allowing users to query project data in natural language and receive context-aware insights.
AI Features
AI-generated sprint summaries
Natural language project querying
Semantic search using embeddings
Retrieval-Augmented Generation (RAG)
Context-aware task and comment retrieval
Blocker detection from project discussions
Workload and progress analysis
Intelligent project insights

Background Processing
Asynchronous embedding generation
BullMQ job queues
Redis-based task processing
Scalable AI pipelines

Backend
-
Node.js
Express.js
MongoDB
Mongoose

Authentication & Security
-
JWT
bcrypt
Helmet
Zod / Joi

AI & RAG
-
OpenAI API
MongoDB Atlas Vector Search
Embeddings

Background Jobs
-
BullMQ
Redis

AI Workflow
-
User Query
    ->
Embedding Generation
    ->
Vector Search
    ->
Retrieve Relevant Context
    ->
LLM Response Generation
    ->
Answer Returned

Project Architecture
Client
   ->
Routes
   ->
Controllers
   ->
Services
   ->
MongoDB
   ->
Response

DevFlow combines modern backend engineering practices with RAG-based AI capabilities to create an intelligent project management platform for development teams.
