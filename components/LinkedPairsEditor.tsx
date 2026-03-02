'use client';

import { useState } from 'react';
import type { LinkedPairs } from '@/types';
import type { Player } from '@/types';
import ParticipantDropdown from './ParticipantDropdown';

interface LinkedPairsEditorProps {
  slots: Player[];
  linkedPairs: LinkedPairs;
  onAdd: (id1: string, id2: string) => void;
  onRemove: (index: number) => void;
}

/** 반드시 같은 팀에 넣을 참가자 쌍 추가/삭제 */
export default function LinkedPairsEditor({
  slots,
  linkedPairs,
  onAdd,
  onRemove,
}: LinkedPairsEditorProps) {
  const [selectA, setSelectA] = useState('');
  const [selectB, setSelectB] = useState('');

  const addDisabled =
    !selectA ||
    !selectB ||
    selectA === selectB ||
    linkedPairs.some(
      ([a, b]) =>
        (a === selectA && b === selectB) || (a === selectB && b === selectA),
    );

  const handleAdd = () => {
    if (addDisabled) return;
    const [id1, id2] = [selectA, selectB].sort();
    onAdd(id1, id2);
    setSelectA('');
    setSelectB('');
  };

  const slotLabel = (id: string) => {
    const i = slots.findIndex((p) => p.id === id);
    const name = slots[i]?.name?.trim() || '';
    return `참가자 ${i + 1}${name ? ` (${name})` : ''}`;
  };

  return (
    <div className="rounded-xl border border-lol-border bg-lol-bg-card/80 p-5 shadow-inner ring-1 ring-black/5">
      <div className="mb-4 flex items-center gap-2 border-l-4 border-lol-gold pl-3">
        <h4 className="lol-section-title text-sm uppercase tracking-wider">
          같은 팀 지정
        </h4>
        <span className="lol-desc text-lol-muted">(떨어지면 안 되는 조합)</span>
      </div>
      <p className="lol-desc mb-4 text-lol-muted">
        지정한 두 명은 항상 같은 팀에 배치됩니다. 여러 쌍을 넣으면 묶임이 이어질 수 있습니다.
      </p>
      {linkedPairs.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {linkedPairs.map(([id1, id2], idx) => (
            <li
              key={`${id1}-${id2}-${idx}`}
              className="flex items-center gap-2 rounded-lg border border-lol-border/70 bg-lol-card/70 py-2 pl-3 pr-1 shadow-sm"
            >
              <span className="lol-desc text-lol-gold-bright">
                {slotLabel(id1)} <span className="text-lol-gold/80">↔</span> {slotLabel(id2)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="rounded p-1.5 text-lol-muted transition-colors hover:bg-red-500/20 hover:text-red-400"
                aria-label="제거"
                title="제거"
              >
                <span className="text-sm">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-lol-border/60 bg-lol-card/40 p-4">
        <label className="flex flex-col gap-1.5">
          <span className="lol-desc text-lol-muted">참가자 1</span>
          <ParticipantDropdown
            slots={slots}
            value={selectA}
            onChange={setSelectA}
            excludeId={selectB}
            placeholder="선택"
          />
        </label>
        <span className="lol-desc pb-2.5 text-lg text-lol-gold/70">↔</span>
        <label className="flex flex-col gap-1.5">
          <span className="lol-desc text-lol-muted">참가자 2</span>
          <ParticipantDropdown
            slots={slots}
            value={selectB}
            onChange={setSelectB}
            excludeId={selectA}
            placeholder="선택"
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={addDisabled}
          className="lol-btn-primary rounded-lg py-2.5 px-4"
        >
          추가
        </button>
      </div>
    </div>
  );
}
