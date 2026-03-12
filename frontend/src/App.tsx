import './App.css';
import BlogList from './components/BlogList';
import Search from './components/Search';

function App() {
  return (
    <div className="App">
      <header>
        <h1>BlogSpot: Tech Blog Aggregator</h1>
      </header>
      <main>
        <Search />
        <BlogList />
      </main>
    </div>
  );
}

export default App
