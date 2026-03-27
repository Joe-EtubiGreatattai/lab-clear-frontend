import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, X, Sparkles } from 'lucide-react';
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
        className={`rounded-2xl border-2 border-dashed p-6 transition-colors duration-200 cursor-pointer
          ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-primary-200 bg-primary-50/40 hover:border-primary-400 hover:bg-primary-50'}`}
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
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary-700">Upload or drag a photo of a lab report</p>
              <p className="text-xs text-primary-500 mt-1">AI will auto-fill the form from the image</p>
            </div>
          </div>
        )}

        {isExtracting && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-600 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-primary-700">Analyzing image with AI…</p>
            <p className="text-xs text-primary-400">This will only take a moment</p>
          </div>
        )}

        {imagePreview && !isExtracting && (
          <div className="flex items-center gap-4">
            <img src={imagePreview} alt="Lab report" className="h-20 w-auto rounded-xl border border-primary-200 object-contain" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-700">Photo uploaded — form has been filled</p>
              <p className="text-xs text-primary-500 mt-1">Review and edit the extracted data below</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Patient selection */}
      <div className="card">
        <h3 className="font-heading font-bold text-slate-900 mb-4">Select Patient</h3>
        <PatientSearch onSelect={setSelectedPatient} selected={selectedPatient} />
        {!selectedPatient && <p className="text-xs text-slate-400 mt-2">Search by name or MRN number</p>}
        {selectedPatient && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {selectedPatient.firstName} {selectedPatient.lastName} — MRN: {selectedPatient.mrn}
          </div>
        )}
      </div>

      {/* Test info */}
      <div className="card">
        <h3 className="font-heading font-bold text-slate-900 mb-5">Test Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Test Name *</label>
            <input {...register('testName')} placeholder="e.g. Complete Blood Count" className="input-field" />
            {errors.testName && <p className="text-red-500 text-xs mt-1.5">{errors.testName.message}</p>}
          </div>
          <div>
            <label className="input-label">Test Code</label>
            <input {...register('testCode')} placeholder="e.g. CBC" className="input-field" />
          </div>
          <div>
            <label className="input-label">Collection Date *</label>
            <input type="date" {...register('collectionDate')} className="input-field" />
            {errors.collectionDate && <p className="text-red-500 text-xs mt-1.5">{errors.collectionDate.message}</p>}
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
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-slate-900">Result Items</h3>
            <p className="text-xs text-slate-400 mt-0.5">Add each individual test marker</p>
          </div>
          <button
            type="button"
            onClick={() => append({ name: '', value: '', unit: '', referenceRange: '', flag: '' })}
            className="btn-secondary text-xs px-3 py-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add Row
          </button>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-12 gap-2 mb-2 px-1">
          {['Test Name', 'Value', 'Unit', 'Reference Range', 'Flag', ''].map((h) => (
            <div key={h} className={`text-xs font-semibold text-slate-400 uppercase tracking-wide ${h === 'Test Name' ? 'col-span-3' : h === 'Reference Range' ? 'col-span-3' : h === '' ? 'col-span-1' : 'col-span-2'}`}>
              {h}
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border ${index % 2 === 0 ? 'bg-slate-50/60 border-slate-100' : 'bg-white border-slate-100'}`}
            >
              <div className="col-span-12 sm:col-span-3">
                <input {...register(`rawResults.${index}.name`)} placeholder="Test name" className="input-field text-xs py-2" />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <input {...register(`rawResults.${index}.value`)} placeholder="Value" className="input-field text-xs py-2" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input {...register(`rawResults.${index}.unit`)} placeholder="Unit" className="input-field text-xs py-2" />
              </div>
              <div className="col-span-7 sm:col-span-3">
                <input {...register(`rawResults.${index}.referenceRange`)} placeholder="e.g. 13.5 – 17.5" className="input-field text-xs py-2" />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <select {...register(`rawResults.${index}.flag`)} className="input-field text-xs py-2">
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
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">L=Low · H=High · LL=Critically Low · HH=Critically High · A=Abnormal</p>
      </div>

      {/* Internal notes */}
      <div className="card">
        <h3 className="font-heading font-bold text-slate-900 mb-1">Internal Notes</h3>
        <p className="text-xs text-slate-400 mb-3">Not visible to the patient</p>
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
