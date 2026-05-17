import './App.css';
import './styles/index.scss';
import AIApp from './pages/Home/Ai';
import Robot from './components/Robot';
import robotsdata from './mock/robots.json';

function App() {
  return (
    <>
      <AIApp />
      <ul className='robot-container'>
        {robotsdata.map(r => (
          <Robot id={r.id} name={r.name} email={r.email} key={r.id} />
        ))}
      </ul>
    </>
  );
}

export default App;
