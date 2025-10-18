import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { translations, type Language } from './translations';
import { planetGravities, type PlanetKey } from './constants';
import ReferenceHeightBands from './components/ReferenceHeightBands';
import { Analytics } from "@vercel/analytics/react"

const labelStyle = { fontSize: 12, fontWeight: '500', fill: '#374151' };
const tickStyle = { fontSize: 12, fill: '#9b9c9d' };

export default function FreeFallSimulator() {
  const [m1, setM1] = useState(65);
  const [m2, setM2] = useState(65);
  const [h1, setH1] = useState(67);
  const [h2, setH2] = useState(67);
  const [g, setG] = useState(9.8);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetKey>('earth');

  // Detect browser language and set default
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language;
    return browserLang.startsWith('tr') ? 'tr' : 'en';
  };

  const [language, setLanguage] = useState<Language>(getBrowserLanguage());

  const t = translations[language];

  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [time, setTime] = useState(0);
  const [positions, setPositions] = useState({ ball1: h1, ball2: h2 });
  const [chartData, setChartData] = useState<Array<{
    time: number;
    pos1: number;
    pos2: number;
    vel1: number;
    vel2: number;
    acc1: number;
    acc2: number;
  }>>([]);

  const animationRef = useRef<number | null>(null);
  const animationSectionRef = useRef<HTMLDivElement | null>(null);
  const lastUpdateTimeRef = useRef(0);

  const maxHeight = Math.max(h1, h2);

  // Dynamic step size for height sliders
  const getHeightStep = (height: number): number => {
    if (height < 1000) return 50;
    if (height < 5000) return 100;
    if (height < 20000) return 150;
    return 200;
  };

  const calculatePosition = (h: number, t: number): number => {
    const pos = h - 0.5 * g * t * t;
    return Math.max(0, pos);
  };

  const calculateVelocity = (h: number, t: number): number => {
    const pos = h - 0.5 * g * t * t;
    if (pos <= 0) {
      return 0;
    }
    return g * t;
  };

  const calculateAcceleration = () => {
    return -g;
  };

  useEffect(() => {
    if (!isRunning) return;

    let lastTimestamp: number | null = null;
    let currentTime = time; // Capture current time at start

    const animate = (timestamp: number): void => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      currentTime += deltaTime;

      const pos1 = calculatePosition(h1, currentTime);
      const pos2 = calculatePosition(h2, currentTime);

      setTime(currentTime);
      setPositions({ ball1: pos1, ball2: pos2 });

      const newDataPoint = {
        time: parseFloat(currentTime.toFixed(2)),
        pos1: parseFloat(pos1.toFixed(2)),
        pos2: parseFloat(pos2.toFixed(2)),
        vel1: parseFloat(calculateVelocity(h1, currentTime).toFixed(2)),
        vel2: parseFloat(calculateVelocity(h2, currentTime).toFixed(2)),
        acc1: parseFloat(calculateAcceleration().toFixed(2)),
        acc2: parseFloat(calculateAcceleration().toFixed(2))
      };

      setChartData(prev => [...prev, newDataPoint]);

      if (pos1 > 0 || pos2 > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
        setIsFinished(true);
        setPositions({ ball1: 0, ball2: 0 });
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, time, h1, h2, g]);

  const handleToggle = () => {
    if (!isRunning) {
      if (isFinished) {
        return;
      }
      if (time === 0) {
        setChartData([]);
      }
      setIsRunning(true);
      
      // Scroll to animation if it's not in viewport
      if (animationSectionRef.current) {
        const rect = animationSectionRef.current.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
          animationSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    } else {
      setIsRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTime(0);
    setPositions({ ball1: h1, ball2: h2 });
    setChartData([]);
  };

  const handlePlanetChange = (planet: PlanetKey): void => {
    setSelectedPlanet(planet);
    if (planet !== 'custom') {
      setG(planetGravities[planet]);
    }
  };

  const handleGravityChange = (value: string): void => {
    const newG = parseFloat(value);
    setG(newG);

    // Check if the new value matches any planet
    const matchingPlanet = Object.entries(planetGravities).find(
      ([planet, gravity]) => planet !== 'custom' && Math.abs(gravity - newG) < 0.01
    );

    setSelectedPlanet(matchingPlanet ? matchingPlanet[0] as PlanetKey : 'custom');
  };

  // Update positions when heights change and simulation hasn't started
  useEffect(() => {
    if (!isRunning && !isFinished && time === 0) {
      setPositions({ ball1: h1, ball2: h2 });
    }
  }, [h1, h2, isRunning, isFinished, time]);

  return (
    <>
    <Analytics />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 mt-4 gap-4">
          <h1 className="text-lg sm:text-2xl font-bold text-left text-indigo-800 flex-1">{t.title}</h1>
          <div className="flex gap-2 justify-end flex-shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'} font-medium`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('tr')}
              className={`px-3 py-1 rounded ${language === 'tr' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'} font-medium`}
            >
              TR
            </button>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">{t.parameters}</h2>

          <div className="space-y-4 md:space-y-6">
            {/* Object Properties Section */}
            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2 md:mb-3 pb-2 border-b border-gray-200">{t.objectProperties}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {/* Ball 1 Properties */}
                <div className="bg-red-50 p-3 md:p-6 border-l-4 border-red-500">
                  <h4 className="text-sm md:text-md font-medium text-red-700 mb-2 md:mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full"></div>
                    {t.ball} 1
                  </h4>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        {t.mass}: {m1} kg
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="0.5"
                        value={m1}
                        onChange={(e) => setM1(parseFloat(e.target.value))}
                        disabled={isRunning || time > 0}
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        {t.height}: {h1} m
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="40000"
                        step={getHeightStep(h1)}
                        value={h1}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setH1(val);
                          if (!isRunning && time === 0) setPositions(prev => ({ ...prev, ball1: val }));
                        }}
                        disabled={isRunning || time > 0}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Ball 2 Properties */}
                <div className="bg-blue-50 p-3 md:p-6 border-l-4 border-blue-500">
                  <h4 className="text-sm md:text-md font-medium text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full"></div>
                    {t.ball} 2
                  </h4>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        {t.mass}: {m2} kg
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="0.5"
                        value={m2}
                        onChange={(e) => setM2(parseFloat(e.target.value))}
                        disabled={isRunning || time > 0}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        {t.height}: {h2} m
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="40000"
                        step={getHeightStep(h2)}
                        value={h2}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setH2(val);
                          if (!isRunning && time === 0) setPositions(prev => ({ ...prev, ball2: val }));
                        }}
                        disabled={isRunning || time > 0}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment & Controls Section */}
            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2 md:mb-3 pb-2 border-b border-gray-200">{t.environmentControls}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-end">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t.celestialBody}
                  </label>
                  <select
                    value={selectedPlanet}
                    onChange={(e) => handlePlanetChange(e.target.value as PlanetKey)}
                    disabled={isRunning || time > 0}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="custom">{t.custom}</option>
                    <option value="mercury">{t.mercury} (3.7 m/s²)</option>
                    <option value="venus">{t.venus} (8.87 m/s²)</option>
                    <option value="earth">{t.earth} (9.8 m/s²)</option>
                    <option value="moon">{t.moon} (1.62 m/s²)</option>
                    <option value="mars">{t.mars} (3.71 m/s²)</option>
                    <option value="jupiter">{t.jupiter} (24.79 m/s²)</option>
                    <option value="saturn">{t.saturn} (10.44 m/s²)</option>
                    <option value="uranus">{t.uranus} (8.87 m/s²)</option>
                    <option value="neptune">{t.neptune} (11.15 m/s²)</option>
                    <option value="pluto">{t.pluto} (0.62 m/s²)</option>
                    <option value="sun">{t.sun} (274 m/s²)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t.gravity}: {g} m/s²
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="280"
                    step="0.1"
                    value={g}
                    onChange={(e) => handleGravityChange(e.target.value)}
                    disabled={isRunning || time > 0}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="flex gap-2 md:gap-3 h-9 md:h-11">
                  {!isFinished ? (
                    <>
                      <button
                        onClick={handleToggle}
                        className={`flex-1 ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-1.5 md:py-2 px-2 md:px-4 text-sm md:text-base rounded-lg flex items-center justify-center gap-1 md:gap-2 transition h-full`}
                      >
                        {isRunning ? <><Pause size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">{t.pause}</span></> : <><Play size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">{t.start}</span></>}
                      </button>
                      {time > 0 && (
                        <button
                          onClick={handleReset}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 md:py-2 px-2 md:px-4 text-sm md:text-base rounded-lg flex items-center justify-center gap-1 md:gap-2 transition h-full"
                        >
                          <RotateCcw size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">{t.reset}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 md:py-2 px-2 md:px-4 text-sm md:text-base rounded-lg flex items-center justify-center gap-1 md:gap-2 transition h-full"
                    >
                      <RotateCcw size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">{t.reset}</span>
                    </button>
                  )}
                </div>

                <div className="px-2 md:px-4 py-2 md:py-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center justify-center h-9 md:h-11">
                  <p className="text-xs md:text-sm text-gray-700 font-medium">
                    <strong>{t.time}:</strong> {time.toFixed(2)} s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animation and X-T Chart Side by Side */}
        <div ref={animationSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Animation Display */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative bg-gradient-to-b from-sky-200 to-sky-50 rounded-lg" style={{ height: '450px' }}>
              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-700 rounded-b-lg"></div>

              {/* Reference height bands */}
              <ReferenceHeightBands maxHeight={maxHeight} language={language} />

              {/* Ball 1 */}
              <div
                className="absolute"
                style={{
                  left: '25%',
                  bottom: `${(positions.ball1 / maxHeight) * 72 + 8}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="text-center mb-1 text-xs font-semibold bg-white px-2 py-1 rounded shadow">
                  {positions.ball1.toFixed(1)}m
                </div>
                <div
                  className="rounded-full bg-red-500 border-4 border-red-700 shadow-lg flex items-center justify-center font-bold text-white"
                  style={{ width: '50px', height: '50px' }}
                >
                  1
                </div>
              </div>

              {/* Ball 2 */}
              <div
                className="absolute"
                style={{
                  left: '50%',
                  bottom: `${(positions.ball2 / maxHeight) * 72 + 8}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="text-center mb-1 text-xs font-semibold bg-white px-2 py-1 rounded shadow">
                  {positions.ball2.toFixed(1)}m
                </div>
                <div
                  className="rounded-full bg-blue-500 border-4 border-blue-700 shadow-lg flex items-center justify-center font-bold text-white"
                  style={{ width: '50px', height: '50px' }}
                >
                  2
                </div>
              </div>

              {/* Height markers */}
              <div className="absolute left-2 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-600 font-medium">
                <span>{maxHeight}m</span>
                <span>{(maxHeight * 0.5).toFixed(0)}m</span>
                <span>0m</span>
              </div>
            </div>
          </div>

          {/* Position vs Time Chart */}
          <div className="bg-white rounded-lg shadow-lg pl-3 pt-7 pr-6 pb-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis height={38} dataKey="time" label={{ value: t.timeLabel, position: 'insideBottom', offset: -2, ...labelStyle }} tick={tickStyle} />
                  <YAxis width={40} label={{ value: t.positionLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, ...labelStyle }} tick={tickStyle} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pos1" stroke="#ef4444" name={`${t.ball} 1`} dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="pos2" stroke="#3b82f6" name={`${t.ball} 2`} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[450px] text-gray-400">
                <p>{t.pressStart}</p>
              </div>
            )}
          </div>
        </div>

        {/* V-T and A-T Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Velocity vs Time */}
          <div className="bg-white rounded-lg shadow-lg pl-3 pt-7 pr-6 pb-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis height={38} dataKey="time" label={{ value: t.timeLabel, position: 'insideBottom', offset: -2, ...labelStyle }} tick={tickStyle} />
                  <YAxis width={40} label={{ value: t.velocityLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, ...labelStyle }} tick={tickStyle} />
                  <Tooltip />
                  <Line type="monotone" dataKey="vel1" stroke="#ef4444" name={`${t.ball} 1`} dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="vel2" stroke="#3b82f6" name={`${t.ball} 2`} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-gray-400">
                <p>{t.pressStart}</p>
              </div>
            )}
          </div>

          {/* Acceleration vs Time */}
          <div className="bg-white rounded-lg shadow-lg pl-3 pt-7 pr-6 pb-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis height={38} dataKey="time" label={{ value: t.timeLabel, position: 'insideBottom', offset: -2, ...labelStyle }} tick={tickStyle} />
                  <YAxis width={40} label={{ value: t.accelerationLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, ...labelStyle }} tick={tickStyle} />
                  <Tooltip />
                  <Line type="monotone" dataKey="acc1" stroke="#ef4444" name={`${t.ball} 1`} dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="acc2" stroke="#3b82f6" name={`${t.ball} 2`} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-gray-400">
                <p>Press Start to begin simulation</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 pb-1">
          <div className="text-center text-gray-600 space-y-3">
            {/* Logo */}
            <div className="flex justify-center items-center -mt-10">
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="mx-4">
                <svg width="32" height="14" viewBox="0 0 48 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                  <path d="M24 12L32 11.7L24 0.4V12Z" fill="#0D79BE" />
                  <path d="M24 12L16 11.7L24 0.4V12Z" fill="#3790BB" />
                  <path d="M24 12L0.7 0L7 21L18 17L24 12Z" fill="#F69226" />
                  <path d="M24 12L47.3 0L41 21L30 17L24 12Z" fill="#D06A29" />
                  <path d="M24 12L41 21H7L24 12Z" fill="#ED7723" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 pt-1">
              <div className="flex items-center gap-0 text-xs text-gray-500">
                <span>made with ♥ by wunnle</span>
              </div>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-xs">
                <a
                  href="https://github.com/wunnle/free-fall-simulator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
                >
                  view on GitHub
                </a>
                <span className="text-gray-400">•</span>
                <a
                  href="https://kafagoz.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
                >
                  kafagoz.com
                </a>
                <span className="text-gray-400">•</span>
                <a
                  href="https://wunnle.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
                >
                  wunnle.dev
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}