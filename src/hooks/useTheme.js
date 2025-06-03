import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Obtiene el tema del localStorage al inicio, o usa 'light' como predeterminado
  const [theme, setTheme] = useState(() => {
    // Revisa si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    // Revisa si el usuario prefiere modo oscuro en su sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Usa el tema guardado, o el preferido del sistema, o light como fallback
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  // Este efecto aplica la clase 'dark' al documento cuando cambia el tema
  useEffect(() => {
    // Guarda el tema en localStorage para mantenerlo entre sesiones
    localStorage.setItem('theme', theme);
    
    // Aplica la clase 'dark' al elemento HTML
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('Tema cambiado a:', theme); // Debugging
  }, [theme]);

  // Función para alternar entre temas
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};