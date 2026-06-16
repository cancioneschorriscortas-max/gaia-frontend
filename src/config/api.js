// Única fonte da URL base da API. Importar desde aquí:
//   import { API } from './config/api'    → ficheiros en src/
//   import { API } from '../config/api'   → src/components/, src/contexts/
// Cambiar a URL en .env (REACT_APP_API), nunca máis 32 copias.
export const API = process.env.REACT_APP_API || 'http://localhost:4000';

export default API;
