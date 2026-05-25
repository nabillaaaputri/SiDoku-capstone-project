# -*- coding: utf-8 -*-
"""
routes/chat.py
POST /chat — stateless chatbot intent classification.
Returns the natural-language reply + action tag.
The Express backend handles any follow-up API calls based on `action`.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from chatbot.chatbot import get_response

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    action: str
    tag: str | None


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest):
    """
    Classify the user's message and return the chatbot reply.

    - **message**: user's input text (in Bahasa Indonesia, slang-words supported)
    - **response**: natural language reply from the chatbot
    - **action**: action identifier (e.g. `fetch_daily_sales`, `predict_future_sales`)
    - **tag**: matched intent tag, or null if unrecognised
    """
    result = get_response(body.message)
    return ChatResponse(
        response=result["response"],
        action=result["action"],
        tag=result["tag"],
    )
