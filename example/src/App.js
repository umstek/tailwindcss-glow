import "./App.css";

function App() {
  return (
    <div className="App container mx-auto">
      <div className="bg-red-500">This example is not production ready.</div>
      <div className="flex my-16">
        <div className="m-2 p-4 glow-blue-500">glow-blue-500</div>
        <div className="m-2 p-4 glow-blue-500-md">glow-blue-500-md</div>
        <div className="m-2 p-4 glow-blue-500-lg">glow-blue-500-lg</div>
        <div className="m-2 p-4 glow-blue-500-xl">glow-blue-500-xl</div>
        <div className="m-2 p-4 glow-blue-500-outline">
          glow-blue-500-outline
        </div>
        <div className="m-2 p-4 glow-dynamic bg-red-500 text-white hover:bg-green-500">
          glow-dynamic
        </div>
        <div className="m-2 p-4 glow-dynamic-md bg-red-500 text-white hover:bg-green-500">
          glow-dynamic-md
        </div>
      </div>
      <div
        className="my-16 glow-dynamic-md"
        style={{
          backgroundColor: `#00DBDE`,
          backgroundImage: `linear-gradient(90deg, #00DBDE 0%, #FC00FF 100%)`,
        }}
      >
        <p>glow-dynamic-md with gradient</p>
      </div>
    </div>
  );
}

export default App;
