import type { JSX } from 'react';
import simulation from './../main'

export default function App(): JSX.Element {

  const startSimulation = () => {
    simulation.run();
  }

  return (
    <div id="simulation">
      <div className="flex items-center justify-center h-screen overflow-hidden w-full bg-gray-900 space-x-3 p-3 text-gray-100">
        <aside className="w-1/3 h-full border-gray-700 border-2 bg-black flex flex-col xl:min-w-[800px] lg:min-w-[600px]">
          <header className="flex items-center justify-between font-mono uppercase border-b-2 px-3 border-gray-700 h-10">
            <h1>POLE's Flight Sim</h1>
          </header>
          <div className="grid grid-cols-6 gap-3 p-3 h-full flex-1 overflow-hidden grid-rows-12">
            <div className="bg-gray-800 border-green-500 border flex items-center justify-center col-span-3 h-full row-span-2">
              //
            </div>
            <button onClick={startSimulation} type="button" className="cursor-pointer col-span-1 bg-gray-800 border-green-500 border flex items-center justify-center h-full p-3 text-center">
              Start Simulation
            </button>
          </div>
        </aside>
        <div className="w-2/3 h-full bg-black border-gray-700 border-2 p-3">
          main canvas
        </div>
      </div>
    </div>
  );
}