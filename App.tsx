
import React, { useState } from 'react';
import { Persona } from './types';
import PersonaSelection from './components/PersonaSelection';
import ChatScreen from './components/ChatScreen';

const App: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handleBack = () => {
    setSelectedPersona(null);
  };

  return (
    <div className="h-screen w-screen bg-green-900 font-sans">
      {!selectedPersona ? (
        <PersonaSelection onPersonaSelect={handlePersonaSelect} />
      ) : (
        <ChatScreen persona={selectedPersona} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
