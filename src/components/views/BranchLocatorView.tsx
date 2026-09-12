import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink, 
  Navigation, 
  Building, 
  Search, 
  CheckCircle, 
  Filter, 
  Database 
} from 'lucide-react';
import { ChannelPartnerBranch } from '../../types';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { dataStore } from '../../services/dataStore';

interface BranchLocatorViewProps {
  language: Language;
}

export const BranchLocatorView: React.FC<BranchLocatorViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [branches, setBranches] = useState<ChannelPartnerBranch[]>(() => dataStore.getBranches());

  useEffect(() => {
    return dataStore.subscribe(() => {
      setBranches(dataStore.getBranches());
    });
  }, []);

  const [selectedCorp, setSelectedCorp] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<ChannelPartnerBranch>(branches[0] || {} as ChannelPartnerBranch);

  // Keep selected branch valid when branches change
  useEffect(() => {
    if (!selectedBranch?.id && branches.length > 0) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  // States available in branch database
  const states = ['All', ...Array.from(new Set(branches.map(b => b.state)))];

  // Request browser geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation permission error or unavailable", error);
        }
      );
    }
  };

  // Haversine distance formula in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  // Filter branches
  const filteredBranches = branches.filter(b => {
    const matchCorp = selectedCorp === 'All' || b.corporation === selectedCorp;
    const matchState = selectedState === 'All' || b.state === selectedState;
    const matchType = selectedType === 'All' || b.agencyType === selectedType;
    const matchQuery = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCorp && matchState && matchType && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              District Nodal Centers & Banks
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Official Implementing Channels
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <Database className="w-3 h-3 text-indigo-500" />
              <span>{branches.length} Registered Center Points</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {t.branchesTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.branchesSubtitle}
          </p>
        </div>

        <button
          onClick={handleGetLocation}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition border border-indigo-200 dark:border-indigo-800 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{userLocation ? "Location Synced" : "Find Closest to My Location"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by city, district or bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Corporation filter */}
        <div>
          <select
            value={selectedCorp}
            onChange={(e) => setSelectedCorp(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Apex Corporations</option>
            <option value="NSFDC">NSFDC (Scheduled Castes)</option>
            <option value="NBCFDC">NBCFDC (Backward Classes)</option>
            <option value="NSKFDC">NSKFDC (Safai Karamcharis)</option>
          </select>
        </div>

        {/* State filter */}
        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {states.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All States & UTs' : s}</option>
            ))}
          </select>
        </div>

        {/* Agency Type filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Agency Types</option>
            <option value="SCA">State Channelising Agency (SCA)</option>
            <option value="Bank">Public Sector Bank (PSB / Bank)</option>
            <option value="RRB">Regional Rural Bank (RRB)</option>
            <option value="Social_Welfare_Office">District Social Welfare Office</option>
          </select>
        </div>
      </div>

      {/* Main Layout: List & Map details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Branches Cards List */}
        <div className="lg:col-span-6 space-y-4 max-h-[680px] overflow-y-auto pr-1">
          {filteredBranches.map(branch => {
            const isSelected = selectedBranch.id === branch.id;
            const distance = userLocation 
              ? calculateDistance(userLocation.lat, userLocation.lng, branch.lat, branch.lng)
              : null;

            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  isSelected 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        branch.agencyType === 'SCA' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300' :
                        branch.agencyType === 'Bank' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' :
                        branch.agencyType === 'RRB' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' :
                        'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      }`}>
                        {branch.agencyType}
                      </span>
                      {branch.isDemoData && (
                        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          Demo Data
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {branch.district}, {branch.state}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {branch.name}
                    </h3>
                  </div>

                  {distance !== null && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0">
                      ~{distance} km
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {branch.address}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{branch.phone}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{branch.operatingHours}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Branch Detail Card & Interactive Google Map Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            {/* Embedded Google Map */}
            <div className="h-64 bg-slate-100 dark:bg-slate-800 relative">
              <iframe
                title="Branch Map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${selectedBranch.lat},${selectedBranch.lng}&z=14&output=embed`}
                allowFullScreen
              ></iframe>
            </div>

            {/* Branch Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                    {selectedBranch.agencyType}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedBranch.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Channel for: {selectedBranch.corporation} Beneficiaries
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.lat},${selectedBranch.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  <span>{selectedBranch.address}, PIN: {selectedBranch.pincode}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Phone: <a href={`tel:${selectedBranch.phone}`} className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedBranch.phone}</a></span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Email: <a href={`mailto:${selectedBranch.email}`} className="text-indigo-600 dark:text-indigo-400">{selectedBranch.email}</a></span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>Working Hours: {selectedBranch.operatingHours}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">Assigned Nodal Officer: </span>
                {selectedBranch.contactPerson} (Assistance for Loan Application & Dossier Submission)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
