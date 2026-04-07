import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, X, Activity } from 'lucide-react';
import { createResultApi, extractFromImageApi } from '../../api/result.api';
import { getPatientApi } from '../../api/patient.api';
import PatientSearch from './PatientSearch';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const resultItemSchema = z.object({
  name: z.string().min(1, 'Name required'),
  value: z.string().min(1, 'Value required'),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  flag: z.enum(['', 'L', 'H', 'LL', 'HH', 'A']).default(''),
});

const schema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  testCode: z.string().optional(),
  collectionDate: z.string().min(1, 'Collection date is required'),
  labName: z.string().optional(),
  status: z.enum(['pending', 'normal', 'abnormal', 'critical']),
  notes: z.string().optional(),
  rawResults: z.array(resultItemSchema).min(1, 'Add at least one result'),
});

const ResultForm = ({ preselectedPatientId }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!preselectedPatientId) return;
    getPatientApi(preselectedPatientId)
      .then(({ data }) => setSelectedPatient(data.patient))
      .catch(() => {});
  }, [preselectedPatientId]);

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'pending',
      rawResults: [{ name: '', value: '', unit: '', referenceRange: '', flag: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'rawResults' });

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      setIsExtracting(true);
      try {
        const res = await extractFromImageApi(dataUrl.split(',')[1], file.type);
        const d = res.data.data;
        if (d.testName) setValue('testName', d.testName);
        if (d.testCode) setValue('testCode', d.testCode);
        if (d.collectionDate) setValue('collectionDate', d.collectionDate);
        if (d.labName) setValue('labName', d.labName);
        if (d.status) setValue('status', d.status);
        if (d.rawResults?.length) {
          replace(d.rawResults.map((r) => ({
            name: r.name || '', value: r.value || '',
            unit: r.unit || '', referenceRange: r.referenceRange || '', flag: r.flag || '',
          })));
        }
        toast.success('Data extracted — please review before saving');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not extract data from image');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const onSubmit = async (data) => {
    if (!selectedPatient) { toast.error('Please select a patient'); return; }
    try {
      await createResultApi({ ...data, patient: selectedPatient._id });
      toast.success('Result saved! AI summary is being generated.');
      navigate('/staff/results');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add result');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Photo extract zone */}
      <div
        className={`rounded-[2rem] border-2 border-dashed p-10 transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-surface-200 bg-white hover:border-primary-400 hover:bg-surface-50 shadow-sm'
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => processFile(e.target.files[0])}
        />

        {!imagePreview && !isExtracting && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center shadow-glow-primary mb-2">
              <Upload className="w-7 h-7 text-primary-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-surface-900 tracking-tight">Upload Clinical Laboratory Document</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">AI Automated Diagnostic Digitization</p>
            </div>
          </div>
        )}

        {isExtracting && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0 animate-glowPulse border border-primary-100 shadow-glow-primary">
              <Activity className="w-8 h-8 text-primary-600 animate-pulse2" />
            </div>
            <p className="text-base font-bold text-surface-900 tracking-tight">Digitizing Medical Records…</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400">Processing Diagnostic Metadata</p>
          </div>
        )}

        {imagePreview && !isExtracting && (
          <div className="flex items-center gap-6 p-4 bg-surface-50 rounded-2xl border border-surface-100 w-full animate-fadeIn">
            <img src={imagePreview} alt="Lab report" className="h-24 w-auto rounded-xl shadow-card border border-white" />
            <div className="flex-1">
              <p className="text-base font-bold text-surface-900 tracking-tight">Diagnostic Document Uploaded</p>
              <p className="text-xs font-medium text-surface-500 mt-1">Digital extraction complete — please valid diagnostic parameters below.</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="w-10 h-10 rounded-full bg-white border border-surface-200 text-surface-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm flex items-center justify-center flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Patient selection */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-surface-100 shadow-card">
        <h3 className="font-heading font-bold text-surface-900 mb-6 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
          Patient Identification
        </h3>
        <PatientSearch onSelect={setSelectedPatient} selected={selectedPatient} />
        {!selectedPatient && <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mt-4">Search Diagnostic Registry index by name or MRN</p>}
        {selectedPatient && (
          <div className="mt-4 flex items-center gap-2.5 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl w-fit animate-fadeIn">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {selectedPatient.firstName} {selectedPatient.lastName} — MRN: <span className="font-mono text-xs">{selectedPatient.mrn}</span>
          </div>
        )}
      </div>

      {/* Test info */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-surface-100 shadow-card">
        <h3 className="font-heading font-bold text-surface-900 mb-8 text-xs uppercase tracking-[0.2em]">Diagnostic Test Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Test Name *</label>
            <input {...register('testName')} placeholder="e.g. Complete Blood Count" className="input-field" />
            {errors.testName && <p className="text-red-400 text-xs mt-1.5">{errors.testName.message}</p>}
          </div>
          <div>
            <label className="input-label">Test Code</label>
            <input {...register('testCode')} placeholder="e.g. CBC" className="input-field" />
          </div>
          <div>
            <label className="input-label">Collection Date *</label>
            <input type="date" {...register('collectionDate')} className="input-field" />
            {errors.collectionDate && <p className="text-red-400 text-xs mt-1.5">{errors.collectionDate.message}</p>}
          </div>
          <div>
            <label className="input-label">Lab Name</label>
            <input {...register('labName')} placeholder="e.g. City Medical Lab" className="input-field" />
          </div>
          <div>
            <label className="input-label">Overall Status</label>
            <select {...register('status')} className="input-field">
              <option value="pending">Pending</option>
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result items */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-surface-100 shadow-card">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-heading font-bold text-surface-900 text-xs uppercase tracking-[0.2em]">Clinical Biometrics</h3>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Raw Laboratory Observations</p>
          </div>
          <button
            type="button"
            onClick={() => append({ name: '', value: '', unit: '', referenceRange: '', flag: '' })}
            className="btn-secondary text-[10px] uppercase font-bold tracking-widest px-6 py-2.5 rounded-full"
          >
            <Plus className="w-3.5 h-3.5" /> Add Metric
          </button>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-12 gap-4 mb-4 px-1">
          {['Diagnostic Parameter', 'Value', 'Unit', 'Reference Window', 'Status', ''].map((h) => (
            <div
              key={h}
              className={`text-[10px] font-bold text-surface-400 uppercase tracking-widest
                ${h === 'Diagnostic Parameter' ? 'col-span-3' : h === 'Reference Window' ? 'col-span-3' : h === '' ? 'col-span-1' : 'col-span-2'}`}
            >
              {h}
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-colors
                ${index % 2 === 0 ? 'bg-surface-50/50 border-surface-100' : 'bg-transparent border-transparent'}`}
            >
              <div className="col-span-12 sm:col-span-3">
                <input {...register(`rawResults.${index}.name`)} placeholder="Test name" className="input-field text-xs py-2" />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <input {...register(`rawResults.${index}.value`)} placeholder="Value" className="input-field text-xs py-2 font-mono" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input {...register(`rawResults.${index}.unit`)} placeholder="Unit" className="input-field text-xs py-2" />
              </div>
              <div className="col-span-7 sm:col-span-3">
                <input {...register(`rawResults.${index}.referenceRange`)} placeholder="e.g. 13.5 – 17.5" className="input-field text-xs py-2 font-mono" />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <select {...register(`rawResults.${index}.flag`)} className="input-field text-xs py-2 font-mono">
                  <option value="">—</option>
                  <option value="L">L</option>
                  <option value="H">H</option>
                  <option value="LL">LL</option>
                  <option value="HH">HH</option>
                  <option value="A">A</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1 flex justify-end">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-6 bg-surface-50/80 px-4 py-2 rounded-lg border border-surface-100">
          Clinical Legend: L=Low · H=High · LL=Critically Low · HH=Critically High · A=Abnormal
        </p>
      </div>

      {/* Internal notes */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-surface-100 shadow-card">
        <h3 className="font-heading font-bold text-surface-900 text-xs uppercase tracking-[0.2em]">Internal Diagnostics Registry</h3>
        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1 mb-6 italic">Secure records not visible to patients</p>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Add any internal notes, context, or follow-up instructions…"
          className="input-field resize-none"
        />
      </div>

      <div className="flex gap-3 pb-4">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 text-base">
          {isSubmitting ? 'Saving…' : 'Save Result & Generate AI Summary'}
        </button>
        <button type="button" onClick={() => navigate('/staff/results')} className="btn-secondary py-3">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ResultForm;
