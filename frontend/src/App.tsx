import './App.css';
import BlogList from './components/BlogList';
import Search from './components/Search';

function App() {
  return (
    <div className="App">
      <header className="navbar">
        <h1>BlogSpot</h1>
        <Search />
      </header>
      <main>
        <BlogList />
      </main>
    </div>
  );
}

export default App
