import Home from './components/Home';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return(
      <BrowserRouter>
        <Home/>
    </BrowserRouter>
  )
}

export default App;