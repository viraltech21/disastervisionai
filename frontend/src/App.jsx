import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Thermometer, Waves, AlertTriangle, Activity, Map, BarChart3, ShieldAlert,
  MapPin, Search, Wind, Flame, Mountain, Loader2, Crosshair, Plus, Minus
} from 'lucide-react';

// --- MOCK DATA BASED ON PROVIDED CSVS ---
const temperatureData = [
  { year: 1980, temp: 13.9, type: 'historical' },
  { year: 1990, temp: 14.1, type: 'historical' },
  { year: 2000, temp: 14.4, type: 'historical' },
  { year: 2010, temp: 14.7, type: 'historical' },
  { year: 2020, temp: 15.1, type: 'historical' },
  { year: 2024, temp: 15.3, type: 'historical' },
  { year: 2030, temp: 15.8, type: 'predicted' },
  { year: 2040, temp: 16.4, type: 'predicted' },
  { year: 2050, temp: 17.1, type: 'predicted' },
];

const seaLevelData = [
  { year: 1980, level: -41.8, type: 'historical' },
  { year: 1990, level: -16.2, type: 'historical' },
  { year: 2000, level: 10.5, type: 'historical' },
  { year: 2010, level: 42.1, type: 'historical' },
  { year: 2020, level: 85.3, type: 'historical' },
  { year: 2024, level: 101.2, type: 'historical' },
  { year: 2030, level: 135.5, type: 'predicted' },
  { year: 2040, level: 180.0, type: 'predicted' },
  { year: 2050, level: 235.2, type: 'predicted' },
];

const regionalVulnerability = [
  { region: 'South Asia (India/Bangladesh)', risk: 88, mainFactor: 'Monsoon Intensity & Sea Level' },
  { region: 'Western Europe (Spain/Germany)', risk: 65, mainFactor: 'Extreme Heat & Urbanization' },
  { region: 'East Asia (China/Japan)', risk: 78, mainFactor: 'Coastal Vulnerability & Deforestation' },
  { region: 'South America (Brazil)', risk: 72, mainFactor: 'Deforestation & Rainfall' },
  { region: 'North America (US Coastal)', risk: 68, mainFactor: 'Sea Level Rise & Drainage' },
];

// --- COMPONENTS ---
const PredictiveLineChart = ({ data, dataKey, yLabel, color, title }) => {
  const minX = Math.min(...data.map(d => d.year));
  const maxX = Math.max(...data.map(d => d.year));
  const values = data.map(d => d[dataKey]);
  const minY = Math.min(...values) - Math.abs(Math.min(...values) * 0.1);
  const maxY = Math.max(...values) + Math.abs(Math.max(...values) * 0.1);

  const padding = 40;
  const width = 600;
  const height = 250;

  const mapX = (x) => ((x - minX) / (maxX - minX)) * (width - padding * 2) + padding;
  const mapY = (y) => height - padding - ((y - minY) / (maxY - minY)) * (height - padding * 2);

  const histData = data.filter(d => d.type === 'historical' || d.year === 2024);
  const predData = data.filter(d => d.type === 'predicted' || d.year === 2024);

  const histPoints = histData.map(d => `${mapX(d.year)},${mapY(d[dataKey])}`).join(' ');
  const predPoints = predData.map(d => `${mapX(d.year)},${mapY(d[dataKey])}`).join(' ');

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg w-full">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">{title}</h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[400px]">
          {[0, 0.5, 1].map(tick => {
            const y = height - padding - tick * (height - padding * 2);
            return <line key={tick} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="1" />;
          })}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" strokeWidth="2" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#94a3b8" strokeWidth="2" />
          <polyline points={histPoints} fill="none" stroke={color} strokeWidth="3" className="drop-shadow-md" />
          <polyline points={predPoints} fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,6" className="drop-shadow-md" />
          {data.map((d, i) => (
            <circle key={i} cx={mapX(d.year)} cy={mapY(d[dataKey])} r="4" fill={d.type === 'predicted' ? '#f43f5e' : color} className="hover:r-6 transition-all duration-300 cursor-pointer">
              <title>{d.year + ": " + d[dataKey].toFixed(1) + " " + yLabel}</title>
            </circle>
          ))}
          <text x={padding - 10} y={padding} fill="#94a3b8" fontSize="12" textAnchor="end" alignmentBaseline="middle">{maxY.toFixed(0)}</text>
          <text x={padding - 10} y={height - padding} fill="#94a3b8" fontSize="12" textAnchor="end" alignmentBaseline="middle">{minY.toFixed(0)}</text>
          <text x={padding} y={height - padding + 20} fill="#94a3b8" fontSize="12" textAnchor="middle">{minX}</text>
          <text x={width - padding} y={height - padding + 20} fill="#94a3b8" fontSize="12" textAnchor="middle">{maxX}</text>
          <rect x={padding + 20} y={padding} width="10" height="10" fill={color} />
          <text x={padding + 35} y={padding + 9} fill="#cbd5e1" fontSize="12">Historical</text>
          <line x1={padding + 110} y1={padding + 5} x2={padding + 130} y2={padding + 5} stroke="#f43f5e" strokeWidth="3" strokeDasharray="4,4" />
          <text x={padding + 135} y={padding + 9} fill="#cbd5e1" fontSize="12">AI Forecast</text>
        </svg>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('localInsights');
  const [riskFactors, setRiskFactors] = useState({ monsoon: 5, deforestation: 5, urbanization: 5, infrastructure: 5 });
  const [locationInput, setLocationInput] = useState('');
  const [currentMapLocation, setCurrentMapLocation] = useState('World'); 
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const [yearsInput, setYearsInput] = useState(10);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [mapZoom, setMapZoom] = useState(2); 
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  const calculateFloodRisk = () => {
    const { monsoon, deforestation, urbanization, infrastructure } = riskFactors;
    const score = (monsoon * 0.35) + (deforestation * 0.20) + (urbanization * 0.25) + (infrastructure * 0.20);
    return (score * 10).toFixed(1);
  };

  const currentRisk = calculateFloodRisk();
  const isWorldView = mapZoom < 4 || !analysisResult;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (locationInput.trim().length >= 3 && showSuggestions) {
        try {
          const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(locationInput) + "&limit=5");
          const data = await res.json();
          const names = data.map(item => item.display_name);
          setSuggestions([...new Set(names)]);
        } catch (e) {
          console.error("Geocoding error", e);
        }
      } else if (locationInput.trim().length < 3) {
        setSuggestions([]);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 400); 
    return () => clearTimeout(timeoutId);
  }, [locationInput, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (city) => {
    setLocationInput(city);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    let lastWheelTime = 0;
    const handleNativeWheel = (e) => {
      e.preventDefault(); 
      const now = Date.now();
      if (now - lastWheelTime < 250) return;
      lastWheelTime = now;
      if (e.deltaY < 0) {
        setMapZoom(z => { const next = Math.min(z + 1, 20); if (next !== z) setPan({x:0, y:0}); return next; });
      } else {
        setMapZoom(z => { const next = Math.max(z - 1, 2); if (next !== z) setPan({x:0, y:0}); return next; });
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []); 

  const handleZoomInBtn = (e) => {
    e.stopPropagation();
    setMapZoom(z => { const next = Math.min(z + 1, 20); if (next !== z) setPan({x:0, y:0}); return next; });
  };
  const handleZoomOutBtn = (e) => {
    e.stopPropagation();
    setMapZoom(z => { const next = Math.max(z - 1, 2); if (next !== z) setPan({x:0, y:0}); return next; });
  };
  const handleMouseDown = (e) => { setIsPanning(true); lastPos.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { setIsPanning(false); };
  const handleDoubleClick = () => { setMapZoom(11); setPan({ x: 0, y: 0 }); };

  const handleAnalyze = () => {
    if (!locationInput.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    setAnalysisResult(null);
    setMapZoom(11); 
    setPan({ x: 0, y: 0 });
    setCurrentMapLocation(locationInput); 

    setTimeout(() => {
      setAnalysisResult({
        locationAnalysis: `Based on historical topography and our multi-variable flood records, ${locationInput} exhibits concentrated vulnerability in low-lying coastal and dense urban basin areas over the projected ${yearsInput}-year timeframe.`,
        affectedAreas: [
          { areaName: "Central Urban Basin", primaryRisk: "Flash Flooding", riskLevel: "High", x_percent: 45, y_percent: 55, zoneRadius: 280 },
          { areaName: "Industrial & Coastal Zone", primaryRisk: "Sea Level Anomaly", riskLevel: "Critical", x_percent: 65, y_percent: 70, zoneRadius: 220 },
          { areaName: "Western Suburbs", primaryRisk: "Urban Heat Island", riskLevel: "Medium", x_percent: 30, y_percent: 40, zoneRadius: 180 },
          { areaName: "Eastern Highlands", primaryRisk: "Stable Topography", riskLevel: "Low", x_percent: 75, y_percent: 30, zoneRadius: 300 }
        ],
        risks: [
          { category: "Flood Risk", level: "High", details: "Poor drainage infrastructure combined with projected heavy monsoon patterns significantly increases flash flood probability in the central basins." },
          { category: "AQI & Heat", level: "Medium", details: "Industrial output and high concrete density will lead to trapped particulate matter and dangerous heat indices during summer months." },
          { category: "Sea Level / River", level: "Critical", details: "Projected rise based on NOAA altimetry data threatens immediate proximity infrastructure and low-lying residential zones." }
        ],
        solutions: [
          "Implement extensive permeable pavement systems in the Central Urban Basin to naturally absorb and redirect flash flood runoff.",
          "Construct and reinforce dynamic sea walls and levee systems along the primary Industrial zones.",
          "Establish an integrated early warning IoT telemetry network across the Western Suburbs to monitor real-time soil moisture and anomaly data."
        ]
      });
      setLoading(false);
    }, 1500); 
  };

  const getZoneRGB = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': case 'high': return 'rgb(255, 0, 0)'; 
      case 'medium': case 'moderate': return 'rgb(255, 255, 0)'; 
      case 'low': case 'safe': return 'rgb(0, 255, 0)'; 
      default: return 'rgb(128, 128, 128)';
    }
  };

  const getRiskColorInfo = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': case 'high': return { ui: 'text-red-500 bg-red-500/10 border-red-500/30', dot: 'bg-red-500' };
      case 'medium': return { ui: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-500' };
      case 'low': return { ui: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-500' };
      default: return { ui: 'text-slate-400 bg-slate-800 border-slate-700', dot: 'bg-slate-400' };
    }
  };

  const getRiskIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('aqi') || cat.includes('air')) return <Wind className="shrink-0" size={24} />;
    if (cat.includes('flood') || cat.includes('sea') || cat.includes('water') || cat.includes('submerg')) return <Waves className="shrink-0" size={24} />;
    if (cat.includes('fire') || cat.includes('heat') || cat.includes('wild')) return <Flame className="shrink-0" size={24} />;
    if (cat.includes('earthquake') || cat.includes('seismic')) return <Mountain className="shrink-0" size={24} />;
    return <AlertTriangle className="shrink-0" size={24} />;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <header className="bg-red-950 border-b border-red-800 p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
           
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">DisastervisionAI</h1>
              <p className="text-sm text-slate-400">AI-Powered Disaster Early Warning & Impact Prediction Platform</p>
            </div>
          </div>
          
        </div>
      </header>

      <nav className="max-w-7xl mx-auto px-6 py-4 border-b border-slate-800 flex gap-4 overflow-x-auto">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><Activity size={18} /> Global Dashboard</button>
        <button onClick={() => setActiveTab('forecasts')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'forecasts' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><BarChart3 size={18} /> Predictive Forecasts</button>
        <button onClick={() => setActiveTab('risk')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'risk' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><ShieldAlert size={18} /> Risk Assessment</button>
        <button onClick={() => setActiveTab('localInsights')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'localInsights' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><MapPin size={18} /> Local AI Prediction</button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex items-start gap-4">
                <div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><Thermometer size={24} /></div>
                <div><p className="text-slate-400 text-sm font-medium">Avg Global Temp (2024)</p><p className="text-3xl font-bold text-slate-100 mt-1">15.3°C</p></div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Waves size={24} /></div>
                <div><p className="text-slate-400 text-sm font-medium">Sea Level Anomaly</p><p className="text-3xl font-bold text-slate-100 mt-1">+101.2 <span className="text-lg text-slate-500">mm</span></p></div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Map size={24} /></div>
                <div><p className="text-slate-400 text-sm font-medium">Monitored Regions</p><p className="text-3xl font-bold text-slate-100 mt-1">142</p></div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'forecasts' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PredictiveLineChart title="Global Average Temperature Prediction (°C)" data={temperatureData} dataKey="temp" yLabel="°C" color="#fbbf24" />
              <PredictiveLineChart title="Global Sea Level Rise Forecast (mm)" data={seaLevelData} dataKey="level" yLabel="mm" color="#38bdf8" />
            </div>
          </div>
        )}
        {activeTab === 'risk' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-6"><Activity className="text-red-500" /> Interactive Flood Risk Classifier</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {Object.entries({ monsoon: "Monsoon Intensity", deforestation: "Deforestation Rate", urbanization: "Urbanization & Paving", infrastructure: "Deteriorating Infrastructure" }).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">{label}</label>
                      <span className="text-sm font-bold text-emerald-400">{riskFactors[key]} / 10</span>
                    </div>
                    <input type="range" min="1" max="10" value={riskFactors[key]} onChange={(e) => setRiskFactors(prev => ({...prev, [key]: parseInt(e.target.value)}))} className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <div className="text-6xl font-black text-slate-100">{currentRisk}%</div>
                <h4 className="text-lg font-bold text-slate-200 mt-4">{currentRisk > 75 ? 'Critical Danger Zone' : currentRisk > 50 ? 'Moderate Vulnerability' : 'Stable Region'}</h4>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'localInsights' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl p-6 sm:p-8">
              <div className="max-w-3xl mb-8">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-2"><Search className="text-blue-500" />Hyper-Local Climate Risk Prediction</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative" ref={searchRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input type="text" placeholder="e.g., Hyderabad, Miami, Tokyo..." value={locationInput} onChange={(e) => { setLocationInput(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div className="w-full sm:w-48 relative">
                    <input type="number" min="1" max="100" value={yearsInput} onChange={(e) => setYearsInput(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 focus:outline-none focus:border-blue-500 transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Years</span>
                  </div>
                  <button onClick={handleAnalyze} disabled={loading || !locationInput.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[140px]">{loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}</button>
                </div>
              </div>

              <div ref={mapContainerRef} className={`bg-slate-950 border border-slate-700 rounded-xl overflow-hidden min-h-[550px] relative flex justify-center items-center select-none shadow-xl ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDoubleClick={handleDoubleClick}>
                <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-0 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
                    <button onClick={handleZoomInBtn} className="bg-slate-800/90 hover:bg-slate-700 text-white p-2.5 rounded-t-lg border border-slate-600 transition-colors"><Plus size={20} /></button>
                    <button onClick={handleZoomOutBtn} className="bg-slate-800/90 hover:bg-slate-700 text-white p-2.5 rounded-b-lg border border-slate-600 border-t-0 transition-colors"><Minus size={20} /></button>
                </div>
                {analysisResult && !loading && mapZoom !== 11 && (
                  <div onClick={(e) => { e.stopPropagation(); setMapZoom(11); setPan({x:0, y:0}); }} className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-slate-700 px-5 py-2.5 rounded-full text-xs text-slate-200 font-bold shadow-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors"><Crosshair size={16} className="text-emerald-400 animate-pulse" />Snap to Local City View</div>
                )}
                <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, transition: isPanning ? 'none' : 'transform 0.15s ease-out' }}>
                  <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${encodeURIComponent(currentMapLocation)}&t=k&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`} className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80" title="Interactive Map"></iframe>
                  <div className="absolute inset-0 bg-slate-900/30 pointer-events-none z-10"></div>
                  {!isWorldView && analysisResult && !loading && analysisResult.affectedAreas && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden" style={{ isolation: 'isolate' }}>
                      {analysisResult.affectedAreas.map((area, idx) => {
                        const styleInfo = getRiskColorInfo(area.riskLevel);
                        const geoScale = Math.pow(2, mapZoom - 11);
                        const posX = 50 + (Math.max(10, Math.min(90, area.x_percent)) - 50) * geoScale;
                        const posY = 50 + (Math.max(10, Math.min(90, area.y_percent)) - 50) * geoScale;
                        return (
                          <div key={`overlay-${idx}`} className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-100" style={{ left: `${posX}%`, top: `${posY}%` }}>
                            <div className="absolute rounded-full transition-all duration-300" style={{ width: `${(area.zoneRadius || 250) * geoScale}px`, height: `${(area.zoneRadius || 250) * geoScale}px`, backgroundColor: getZoneRGB(area.riskLevel), mixBlendMode: 'screen', filter: 'blur(8px)', opacity: mapZoom >= 10 ? 0.6 : 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="relative flex h-5 w-5 justify-center items-center mb-2 z-30">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styleInfo.dot}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 shadow-lg ${styleInfo.dot}`}></span>
                              </div>
                              <div className={`bg-slate-900/95 border px-3 py-1.5 rounded-lg shadow-xl text-center whitespace-nowrap pointer-events-auto transition-transform hover:scale-105 z-30 ${styleInfo.ui.replace('bg-', 'hover:bg-').replace('text-', 'border-')} ${mapZoom < 8 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                                <p className="text-xs font-bold text-slate-100">{area.areaName}</p>
                                <p className={`text-[10px] font-semibold uppercase tracking-wider ${styleInfo.ui.split(' ')[0]}`}>{area.riskLevel === 'Low' ? 'Safe Zone' : area.riskLevel} • {area.primaryRisk}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {analysisResult && !loading && (
                <div className="space-y-8 mt-8 pt-8 border-t border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2"><Globe className="text-blue-400" size={20} /> Geographical Vulnerability Overview</h3>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.locationAnalysis}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><Activity className="text-red-400" size={20} /> Predicted Risk Factors ({yearsInput} Year Forecast)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analysisResult.risks?.map((risk, idx) => (
                        <div key={idx} className={`border rounded-xl p-5 flex flex-col gap-3 ${getRiskColorInfo(risk.level).ui}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">{getRiskIcon(risk.category)}<span className="font-semibold text-lg">{risk.category}</span></div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-black/20">{risk.level === 'Low' ? 'Safe' : risk.level}</span>
                          </div>
                          <p className="text-sm opacity-90 leading-relaxed mt-2">{risk.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><ShieldAlert className="text-emerald-400" size={20} /> Recommended Mitigation Strategies</h3>
                    <ul className="space-y-3">
                      {analysisResult.solutions?.map((solution, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300"><span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" /><span className="leading-relaxed">{solution}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
