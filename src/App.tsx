import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Upload, User, Phone, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { cn } from './lib/utils';
import { Staff, Position, POSITION_HIERARCHY } from './types';

export default function App() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [orgName, setOrgName] = useState('Koperasi Mitra Dhuafa Cabang Comal');
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<{
    name: string;
    position: Position;
    phone: string;
    photo: string;
  }>({
    name: '',
    position: 'Branch Manager',
    phone: '',
    photo: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addStaff = () => {
    if (!formData.name || !formData.phone || !formData.photo) {
      alert('Please fill all fields and upload a photo');
      return;
    }
    const newStaff: Staff = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setStaffList(prev => [...prev, newStaff]);
    setFormData({
      name: '',
      position: 'Field Officer',
      phone: '',
      photo: '',
    });
  };

  const removeStaff = (id: string) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      // Ensure fonts are loaded before capturing
      await document.fonts.ready;
      
      const dataUrl = await toPng(chartRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FDFCFB',
        // Skip external stylesheets that might cause parsing errors
        filter: (node) => {
          if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            return false;
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `${orgName.replace(/\s+/g, '-').toLowerCase()}-org-chart.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Export failed', err);
      alert(`Export failed: ${err.message || 'Unknown error'}. Try using a different browser or checking your internet connection.`);
    } finally {
      setIsExporting(false);
    }
  };

  const groupedStaff = {
    branchManager: staffList.filter(s => s.position === 'Branch Manager'),
    assistantManager: staffList.filter(s => s.position === 'Assistant Manager'),
    msaFsa: staffList.filter(s => s.position === 'M.S.A' || s.position === 'F.S.A'),
    fieldOfficers: staffList.filter(s => s.position === 'Field Officer'),
  };

  return (
    <div className="min-h-screen bg-brand-bg p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl elegant-shadow border border-stone-100">
            <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2 font-serif italic">
              <Plus className="w-5 h-5 text-brand-accent" /> Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Organization Name</label>
                <input 
                  type="text"
                  placeholder="Organization Name"
                  className="elegant-input w-full"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                />
              </div>

              <div className="h-px bg-stone-100 my-4"></div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Profile Photo</label>
                <div 
                  className="relative h-32 w-full border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent transition-colors overflow-hidden bg-stone-50/50"
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-stone-300" />
                      <span className="text-[10px] text-stone-400 mt-2 uppercase tracking-tighter">Click to upload</span>
                    </>
                  )}
                  <input 
                    id="photo-input"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text"
                    placeholder="Staff Name"
                    className="elegant-input w-full pl-10"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Position</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <select 
                    className="elegant-input w-full pl-10 appearance-none"
                    value={formData.position}
                    onChange={e => setFormData(prev => ({ ...prev, position: e.target.value as Position }))}
                  >
                    {POSITION_HIERARCHY.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    className="elegant-input w-full pl-10"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <button 
                onClick={addStaff}
                className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-accent transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-5 h-5" /> Add to Chart
              </button>
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-white p-6 rounded-2xl elegant-shadow border border-stone-100 overflow-hidden">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Staff List ({staffList.length})</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence>
                {staffList.map(staff => (
                  <motion.div 
                    key={staff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={staff.photo} className="w-10 h-10 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-sm font-bold text-brand-primary truncate max-w-[120px]">{staff.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">{staff.position}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeStaff(staff.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {staffList.length === 0 && (
                <p className="text-center text-stone-300 text-xs py-8 italic font-serif">No staff added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Chart Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-brand-primary font-serif italic">Structure Preview</h1>
            <button 
              onClick={downloadChart}
              disabled={staffList.length === 0 || isExporting}
              className="px-6 py-2 bg-white text-brand-primary font-bold rounded-xl border border-stone-200 hover:bg-stone-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="w-4 h-4 text-brand-accent" /> {isExporting ? 'Exporting...' : 'Download HD'}
            </button>
          </div>

          <div 
            ref={chartRef}
            className="bg-brand-bg rounded-3xl elegant-shadow p-16 min-h-[900px] flex flex-col items-center overflow-x-auto border border-stone-100"
            style={{ minWidth: '1200px' }}
          >
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-brand-primary font-serif italic tracking-tight mb-4">
                {orgName}
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-brand-accent opacity-50"></div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.3em]">Organizational Structure</span>
                <div className="h-px w-16 bg-brand-accent opacity-50"></div>
              </div>
            </div>

            <div className="relative w-full flex flex-col items-center">
              {/* Vertical Line */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-gray-300 -z-0"></div>

              {/* Level 1: Branch Manager */}
              <div className="relative z-10 mb-20">
                {groupedStaff.branchManager.map((staff: Staff) => (
                  <StaffCard key={staff.id} staff={staff} />
                ))}
                {groupedStaff.branchManager.length === 0 && <PlaceholderCard position="Branch Manager" />}
              </div>

              {/* Level 2: Assistant Manager */}
              <div className="relative z-10 mb-20 grid grid-cols-2 gap-x-24 w-full max-w-4xl">
                <div className="flex flex-col items-end relative">
                  {/* Horizontal connection from center to card */}
                  <div className="absolute top-1/2 right-0 w-12 border-t-2 border-dashed border-gray-300 -translate-y-1/2 translate-x-12"></div>
                  {groupedStaff.assistantManager.map((staff: Staff) => (
                    <StaffCard key={staff.id} staff={staff} align="left" />
                  ))}
                  {groupedStaff.assistantManager.length === 0 && <PlaceholderCard position="Assistant Manager" align="left" />}
                </div>
                <div className="relative"></div> {/* Empty right side */}
              </div>

              {/* Level 3: M.S.A & F.S.A */}
              <div className="relative z-10 mb-20 grid grid-cols-2 gap-x-24 w-full max-w-4xl">
                {/* Horizontal connection for MSA/FSA */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 border-t-2 border-dashed border-gray-300 -z-0"></div>
                
                <div className="flex flex-col items-end gap-4 relative">
                  {groupedStaff.msaFsa.filter(s => s.position === 'F.S.A').map((staff: Staff) => (
                    <StaffCard key={staff.id} staff={staff} align="left" />
                  ))}
                  {groupedStaff.msaFsa.filter(s => s.position === 'F.S.A').length === 0 && <PlaceholderCard position="F.S.A" align="left" />}
                </div>
                <div className="flex flex-col items-start gap-4 relative">
                  {groupedStaff.msaFsa.filter(s => s.position === 'M.S.A').map((staff: Staff) => (
                    <StaffCard key={staff.id} staff={staff} align="right" />
                  ))}
                   {groupedStaff.msaFsa.filter(s => s.position === 'M.S.A').length === 0 && <PlaceholderCard position="M.S.A" align="right" />}
                </div>
              </div>

              {/* Level 4: Field Officers */}
              <div className="relative z-10 grid grid-cols-6 gap-x-4 gap-y-12 w-full max-w-7xl">
                {/* Horizontal connector for FO row */}
                <div className="absolute -top-6 left-0 right-0 border-t-2 border-dashed border-gray-300 -z-0"></div>
                
                {groupedStaff.fieldOfficers.map((staff: Staff) => (
                  <div key={staff.id} className="flex flex-col items-center relative">
                    {/* Connection line to the top row */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 border-l-2 border-dashed border-gray-300"></div>
                    <StaffCard staff={staff} align="center" />
                  </div>
                ))}
                {groupedStaff.fieldOfficers.length === 0 && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 border-l-2 border-dashed border-gray-300"></div>
                        <PlaceholderCard position="Field Officer" align="center" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Credit Section (Outside chartRef so it's not downloaded) */}
          <div className="mt-8 pb-12 w-full text-center">
            <p className="text-sm font-medium text-gray-400 tracking-widest uppercase">
              Created by <span className="text-brand-purple font-bold">Mrday</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffCard({ staff, align = 'center' }: { staff: Staff, align?: 'left' | 'right' | 'center', key?: string }) {
  return (
    <div className={cn(
      "flex items-center gap-4 group transition-transform hover:scale-105",
      align === 'left' ? "flex-row-reverse" : "flex-row",
      align === 'center' && "flex-col text-center"
    )}>
      {/* Hexagon Profile */}
      <div className="relative">
        <div className="w-24 h-24 hex-border p-1">
          <div className="w-full h-full hex-clip bg-gray-100 overflow-hidden">
            <img src={staff.photo} className="w-full h-full object-cover" alt={staff.name} referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Info Tag */}
      <div className={cn(
        "relative bg-brand-primary text-white p-4 rounded-lg shadow-2xl min-w-[200px] border border-brand-accent/30",
        align === 'left' ? "text-right" : "text-left",
        align === 'center' && "text-center -mt-4"
      )}>
        {/* Arrow shape for the tag */}
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-primary rotate-45 -z-10 border-r border-b border-brand-accent/30",
          align === 'left' ? "-right-2" : "-left-2",
          align === 'center' && "hidden"
        )}></div>

        <p className="text-sm font-bold uppercase tracking-widest mb-1 text-brand-accent">{staff.name}</p>
        <div className="h-[1px] w-full bg-brand-accent/20 mb-2"></div>
        <p className="text-[10px] font-medium text-stone-300 uppercase tracking-tighter mb-1">{staff.position}</p>
        <p className="text-[9px] font-mono text-stone-400">{staff.phone}</p>
      </div>
    </div>
  );
}

function PlaceholderCard({ position, align = 'center' }: { position: string, align?: 'left' | 'right' | 'center' }) {
  return (
    <div className={cn(
      "flex items-center gap-4 opacity-30 grayscale",
      align === 'left' ? "flex-row-reverse" : "flex-row",
      align === 'center' && "flex-col text-center"
    )}>
      <div className="w-24 h-24 hex-border p-1">
        <div className="w-full h-full hex-clip bg-gray-200 flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <div className={cn(
        "bg-stone-100 text-stone-400 p-4 rounded-lg min-w-[200px] border border-stone-200",
        align === 'center' && "-mt-4"
      )}>
        <p className="text-sm font-bold uppercase tracking-widest mb-1">Staff Name</p>
        <div className="h-[1px] w-full bg-stone-200 mb-2"></div>
        <p className="text-[10px] font-medium uppercase tracking-tighter">{position}</p>
      </div>
    </div>
  );
}
