import {
  ChatMessage,
  ChatSession,
  ChatRequest,
  ChatResponse,
  BillContext
} from './interfaces';

export async function getBillContext(_billId: string, _env: any): Promise<BillContext> {
  throw new Error('Not implemented');
}

export async function getChatSession(
  _sessionId: string,
  _env: any
): Promise<ChatSession | null> {
  throw new Error('Not implemented');
}

export async function createChatSession(
  _billId: string,
  _userId: string,
  _env: any
): Promise<ChatSession> {
  throw new Error('Not implemented');
}

export async function addMessageToSession(
  _sessionId: string,
  _message: ChatMessage,
  _env: any
): Promise<void> {
  throw new Error('Not implemented');
}

export async function generateChatResponse(
  _context: BillContext,
  _messages: ChatMessage[],
  _env: any
): Promise<ChatMessage> {
  throw new Error('Not implemented');
}

export async function chat(
  _request: ChatRequest,
  _userId: string,
  _env: any
): Promise<ChatResponse> {
  throw new Error('Not implemented');
}
