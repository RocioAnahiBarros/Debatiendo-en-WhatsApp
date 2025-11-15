
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Persona, Role, Message } from '../types';
import { startChat } from '../services/geminiService';
import { USER_NAME } from '../constants';
import { SendIcon, BackIcon, DownloadIcon, TypingIcon, StopIcon } from './icons';
import type { Chat } from '@google/genai';

interface ChatScreenProps {
  persona: Persona;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ persona, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    setMessages([]);
    chatSession.current = startChat(persona);
    try {
      const stream = await chatSession.current.sendMessageStream({ message: "Inicia la conversación." });
      let text = '';
      const messageId = Date.now().toString();

      setMessages([{ id: messageId, role: Role.MODEL, text: '' }]);

      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, text } : m))
        );
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setMessages([{
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Lo siento, ha ocurrido un error al iniciar la conversación. Por favor, verifica tu clave de API e intenta de nuevo."
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [persona]);

  useEffect(() => {
    initializeChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);
  
  useEffect(() => {
    const timer = setInterval(() => {
        if(messages.length > 1 && !conversationEnded) { // Only show if conversation has started and not ended
             setShowContinuePrompt(true);
        }
    }, 300000); // 5 minutes

    return () => clearInterval(timer);
  }, [messages, conversationEnded]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || conversationEnded) return;

    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowContinuePrompt(false);

    try {
      if (!chatSession.current) throw new Error("Chat session not initialized.");
      
      const stream = await chatSession.current.sendMessageStream({ message: input });
      let text = '';
      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: Role.MODEL, text: '' }]);

      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev =>
          prev.map(m => (m.id === modelMessageId ? { ...m, text } : m))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "Ha ocurrido un error. No pude procesar tu mensaje."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 15;
    let y = margin;
    const pageHeight = doc.internal.pageSize.height;
    const lineWidth = doc.internal.pageSize.width - margin * 2;

    doc.setFontSize(18);
    doc.text("Historial de Conversación: HORA DE CONVERSAR Y DEBATIR", margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Debate con: ${persona}`, margin, y);
    y += 15;

    messages.forEach(message => {
        if (y > pageHeight - margin - 10) {
            doc.addPage();
            y = margin;
        }
        const speaker = message.role === Role.USER ? `${USER_NAME}:` : `${persona}:`;
        const text = `${speaker} ${message.text}`;
        
        const splitText = doc.splitTextToSize(text, lineWidth);
        
        doc.text(splitText, margin, y);
        y += (splitText.length * 7);
        y += 5; 
    });

    doc.save("conversacion_debate.pdf");
    setShowContinuePrompt(false);
  };

  const handleEndConversation = () => {
    setConversationEnded(true);
    setShowContinuePrompt(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl">
      <header className="flex items-center p-3 border-b-2 border-green-100 bg-green-50 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-green-200 transition-colors">
            <BackIcon />
        </button>
        <div className="ml-4">
            <h2 className="text-lg font-bold text-green-800">{persona}</h2>
            <p className="text-sm text-green-600">En línea</p>
        </div>
      </header>
      
      <main className="flex-grow p-4 overflow-y-auto bg-cover" style={{backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')"}}>
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && messages.length > 0 && <MessageBubble message={{ id: 'loading', role: Role.MODEL, text: '' }} isLoading={true} />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {showContinuePrompt && !conversationEnded && (
        <div className="p-3 bg-green-100 text-center text-sm text-green-800 flex-shrink-0">
            <p className="mb-2">¿Deseas continuar la conversación?</p>
            <button onClick={() => setShowContinuePrompt(false)} className="bg-green-500 text-white px-4 py-1 rounded-full text-xs mx-1 hover:bg-green-600">Continuar</button>
            <button onClick={handleEndConversation} className="bg-white text-green-500 border border-green-500 px-4 py-1 rounded-full text-xs mx-1 hover:bg-gray-50">Finalizar</button>
        </div>
      )}

      <footer className="p-3 bg-gray-100 border-t flex-shrink-0">
        {conversationEnded ? (
           <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
             <p className="text-gray-700 font-medium">La conversación ha finalizado.</p>
             <p className="text-sm text-gray-500">Puedes descargar el historial o comenzar una nueva conversación.</p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
                 <button
                     onClick={handleExport}
                     className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors flex items-center shadow-md w-full sm:w-auto justify-center"
                 >
                     <DownloadIcon />
                     <span className="ml-2">Descargar PDF</span>
                 </button>
                 <button
                     onClick={onBack}
                     className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors flex items-center shadow-md w-full sm:w-auto justify-center"
                 >
                     <BackIcon />
                     <span className="ml-2">Volver al Inicio</span>
                 </button>
             </div>
           </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-grow p-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-green-500 transition-colors"
              disabled={isLoading}
            />
            <button type="submit" className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-green-300 transition-colors" disabled={isLoading || !input.trim()}>
              <SendIcon />
            </button>
            <button
              type="button"
              onClick={handleEndConversation}
              title="Finalizar Conversación"
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 disabled:bg-red-300 transition-colors"
              disabled={isLoading}
            >
              <StopIcon />
            </button>
          </form>
        )}
      </footer>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message; isLoading?: boolean }> = ({ message, isLoading }) => {
  const isUser = message.role === Role.USER;
  return (
    <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${isUser ? 'bg-emerald-200 rounded-br-none' : 'bg-white rounded-bl-none'} shadow`}>
        {isLoading ? <TypingIcon /> : <p className="text-black whitespace-pre-wrap">{message.text}</p>}
      </div>
    </div>
  );
};

export default ChatScreen;
