import React from 'react';
import { Persona } from '../types';
import { UserIcon, UsersIcon, AcademicCapIcon } from './icons';

interface PersonaSelectionProps {
  onPersonaSelect: (persona: Persona) => void;
}

const PersonaCard: React.FC<{
  persona: Persona;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ persona, icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 h-36 w-full md:w-72 text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center justify-center"
  >
    <div className="flex items-center">
      {icon}
      <h3 className="text-xl font-bold ml-4">{persona}</h3>
    </div>
  </button>
);

const PersonaSelection: React.FC<PersonaSelectionProps> = ({ onPersonaSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-white text-center">
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-20" style={{backgroundImage: "url('https://picsum.photos/1200/800?blur=10')"}}></div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-down">
          HORA DE CONVERSAR Y DEBATIR
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl mx-auto animate-fade-in-up">
          Como profesor es bueno que converses y debatas con alguien sobre los desafíos de la educación moderna, por favor elige una de las opciones
        </p>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in">
          <PersonaCard
            persona={Persona.STUDENT}
            icon={<UserIcon />}
            onClick={() => onPersonaSelect(Persona.STUDENT)}
          />
          <PersonaCard
            persona={Persona.COLLEAGUE}
            icon={<UsersIcon />}
            onClick={() => onPersonaSelect(Persona.COLLEAGUE)}
          />
          <PersonaCard
            persona={Persona.AUTHORITY}
            icon={<AcademicCapIcon />}
            onClick={() => onPersonaSelect(Persona.AUTHORITY)}
          />
        </div>
      </div>
      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/70">
        <p>Creado con Google AI Studio por Rocío Anahí Barros alias Caliope</p>
      </footer>
    </div>
  );
};

export default PersonaSelection;