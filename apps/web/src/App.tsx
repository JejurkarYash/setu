import "./App.css";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <AppLayout>
      <div className="p-6 md:p-10">
        <h1 className="font-sans text-3xl font-semibold text-text-primary">Welcome to Setu</h1>
        <p className="mt-2 font-mono text-lg text-brand">
          This is a simple React app with Tailwind CSS.
        </p>
      </div>
    </AppLayout>
  );
}

export default App;
