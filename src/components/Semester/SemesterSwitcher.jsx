import { useState } from 'react';
import { useSemester } from '../../context/SemesterContext';
import CreateSemesterModal from './CreateSemesterModal';

export default function SemesterSwitcher() {
  const { semesters, activeSemester, switchSemester, createSemester, loading } = useSemester();
  const [showModal, setShowModal] = useState(false);

  if (loading) return <div className="h-8 bg-gray-200 animate-pulse rounded" />;

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          value={activeSemester?.id || ''}
          onChange={e => e.target.value && switchSemester(Number(e.target.value))}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1"
        >
          {!activeSemester && <option value="">Pilih Semester</option>}
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium whitespace-nowrap"
        >
          + Baru
        </button>
      </div>

      <CreateSemesterModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={createSemester}
        semesters={semesters}
      />
    </>
  );
}
