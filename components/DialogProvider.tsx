'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';

export interface DialogOptions {
  /** 비우면 종류에 따른 기본 제목 사용 */
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 삭제처럼 되돌릴 수 없는 동작이면 true */
  danger?: boolean;
}

interface DialogState extends DialogOptions {
  kind: 'confirm' | 'alert';
  resolve: (confirmed: boolean) => void;
}

interface DialogApi {
  /** 확인/취소 모달. 확인을 누르면 true */
  confirm: (options: DialogOptions) => Promise<boolean>;
  /** 확인 버튼만 있는 알림 모달 (window.alert 대체) */
  alert: (options: DialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog는 DialogProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const open = useCallback(
    (kind: DialogState['kind'], options: DialogOptions) =>
      new Promise<boolean>((resolve) => {
        setDialog({ ...options, kind, resolve });
      }),
    [],
  );

  const api = useMemo<DialogApi>(
    () => ({
      confirm: (options) => open('confirm', options),
      alert: (options) => open('alert', options).then(() => undefined),
    }),
    [open],
  );

  const close = useCallback((confirmed: boolean) => {
    setDialog((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Dialog dialog={dialog} onClose={close} />
    </DialogContext.Provider>
  );
}

function Dialog({
  dialog,
  onClose,
}: {
  dialog: DialogState | null;
  onClose: (confirmed: boolean) => void;
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // 열릴 때 확인 버튼에 포커스, Esc는 취소로 처리
  useEffect(() => {
    if (!dialog) return;
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dialog, onClose]);

  // 모달이 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!dialog) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [dialog]);

  if (!mounted || !dialog) return null;

  const isConfirm = dialog.kind === 'confirm';
  const title = dialog.title ?? t(isConfirm ? 'dialogConfirmTitle' : 'dialogNoticeTitle');

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
      role='alertdialog'
      aria-modal='true'
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div className='lol-dialog lol-animate-in w-full max-w-md'>
        <div className='lol-dialog-inner'>
          <h2 className='lol-title-gold mb-3 font-cinzel text-base font-bold uppercase tracking-[0.2em]'>
            {title}
          </h2>
          <div className='lol-ornament mb-4' />
          <p className='mb-6 whitespace-pre-line text-center leading-relaxed text-lol-gold-light/90'>
            {dialog.message}
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            {isConfirm && (
              <button
                type='button'
                onClick={() => onClose(false)}
                className='lol-btn-secondary min-w-[110px] py-2.5'
              >
                {dialog.cancelLabel ?? t('dialogCancel')}
              </button>
            )}
            <button
              ref={confirmRef}
              type='button'
              onClick={() => onClose(true)}
              className={cn(
                'min-w-[110px] py-2.5',
                dialog.danger ? 'lol-btn-secondary lol-btn-danger' : 'lol-btn-primary',
              )}
            >
              {dialog.confirmLabel ?? t('dialogConfirm')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
