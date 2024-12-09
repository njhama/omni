from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise ValueError("OpenAI API key is not set in the environment variables.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, "../data")
faiss_index_path = os.path.join(data_dir, "faiss_index")
json_data_path = os.path.join(data_dir, "final.json")

try:
    index = faiss.read_index(faiss_index_path)
except Exception as e:
    raise RuntimeError(f"Error loading FAISS index: {str(e)}")

try:
    with open(json_data_path, 'r') as f:
        data = json.load(f)
except Exception as e:
    raise RuntimeError(f"Error loading JSON data: {str(e)}")

try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    raise RuntimeError(f"Error initializing embedding model: {str(e)}")

class RetrievalRequest(BaseModel):
    query: str
    k: int = 3

class GenerationRequest(BaseModel):
    query: str
    code_snippet: str
    context: str

def generate_response_with_client(context: str, code_snippet: str) -> str:
    prompt = f"""
    Context:
    {context}

    Code Snippet:
    {code_snippet}

    Please FIX this code snippet. Ensure it is correct, efficient, and follows best practices. Provide only the corrected code with minimal inline comments.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
        )
        content = response["choices"][0]["message"]["content"]
        return content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.post("/retrieve")
def retrieve(query_request: RetrievalRequest):
    try:
        query_embedding = embedding_model.encode([query_request.query])
        _, indices = index.search(np.array(query_embedding), query_request.k)
        retrieved_results = [
            {
                "question": data[i]["question_description"],
                "solution_code": data[i]["solution_code"]
            }
            for i in indices[0]
        ]
        context = "\n".join(
            f"Question {i+1}: {result['question']}\nSolution {i+1}: {result['solution_code']}"
            for i, result in enumerate(retrieved_results)
        )
        return {
            "retrieved_results": retrieved_results,
            "context": context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing retrieval: {str(e)}")

@app.post("/generate")
def generate_code(gen_request: GenerationRequest):
    try:
        fixed_code = generate_response_with_client(gen_request.context, gen_request.code_snippet)
        return {"fixed_code": fixed_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing generation: {str(e)}")

@app.get("/success")
def success():
    return {"status": "success", "message": "The server is running properly!"}
