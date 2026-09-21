import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ModalAlertOpts = {
  title?: string;
  message: string;
  okLabel?: string;
};

export type ModalConfirmOpts = ModalAlertOpts & {
  cancelLabel?: string;
  danger?: boolean;
};

type ModalSpec =
  | ({ mode: "alert" } & ModalAlertOpts)
  | ({ mode: "confirm" } & ModalConfirmOpts);

type Resolver = (value: boolean | void) => void;

type Bridge = {
  open: (spec: ModalSpec) => Promise<boolean | void>;
};

let bridge: Bridge | null = null;

function normalize(
  opts: string | ModalAlertOpts | ModalConfirmOpts,
): ModalAlertOpts | ModalConfirmOpts {
  return typeof opts === "string" ? { message: opts } : opts;
}

/** Imperative API — matches mockups/js/modal.js `DLModal` */
export const DLModal = {
  alert(opts: string | ModalAlertOpts): Promise<void> {
    if (!bridge) {
      console.warn("DLModal: ModalHost not mounted");
      return Promise.resolve();
    }
    return bridge.open({ mode: "alert", ...normalize(opts) }) as Promise<void>;
  },
  confirm(opts: string | ModalConfirmOpts): Promise<boolean> {
    if (!bridge) {
      console.warn("DLModal: ModalHost not mounted");
      return Promise.resolve(false);
    }
    return bridge.open({
      mode: "confirm",
      ...normalize(opts),
    }) as Promise<boolean>;
  },
};

export function ModalHost({ children }: { children?: ReactNode }) {
  const [spec, setSpec] = useState<ModalSpec | null>(null);
  const resolveRef = useRef<Resolver | null>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    bridge = {
      open(next) {
        return new Promise((resolve) => {
          if (resolveRef.current) {
            resolveRef.current(next.mode === "alert" ? undefined : false);
          }
          prevFocus.current = document.activeElement as HTMLElement | null;
          resolveRef.current = resolve;
          setSpec(next);
        });
      },
    };
    return () => {
      bridge = null;
    };
  }, []);

  const close = useCallback((result: boolean | void) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setSpec(null);
    document.body.classList.remove("dl-modal-open");
    const focusEl = prevFocus.current;
    prevFocus.current = null;
    queueMicrotask(() => {
      focusEl?.focus?.();
      resolve?.(result);
    });
  }, []);

  useEffect(() => {
    if (!spec) return;
    const current = spec;
    document.body.classList.add("dl-modal-open");
    okRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(current.mode === "alert" ? undefined : false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [spec, close]);

  const isAlert = spec?.mode === "alert";
  const danger = spec?.mode === "confirm" && Boolean(spec.danger);

  return (
    <>
      {children}
      {spec && (
        <div className="dl-modal dl-modal--open">
          <div
            className="dl-modal__backdrop"
            onClick={() => close(isAlert ? undefined : false)}
          />
          <div
            className="dl-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
          >
            <h2 className="dl-modal__title" id={titleId}>
              {spec.title || (isAlert ? "알림" : "확인")}
            </h2>
            <p className="dl-modal__body" id={bodyId}>
              {spec.message}
            </p>
            <div className="dl-modal__actions">
              {!isAlert && (
                <button
                  type="button"
                  className="btn dl-modal__cancel"
                  onClick={() => close(false)}
                >
                  {spec.cancelLabel || "취소"}
                </button>
              )}
              <button
                ref={okRef}
                type="button"
                className={`btn ${danger ? "btn--danger" : "btn--primary"} dl-modal__ok`}
                onClick={() => close(isAlert ? undefined : true)}
              >
                {spec.okLabel || "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
