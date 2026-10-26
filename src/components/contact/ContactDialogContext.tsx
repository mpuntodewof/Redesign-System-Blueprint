import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ContactFormDialog from "@/components/ContactFormDialog";
import type { ContactIntent } from "@/components/contact/intents";

interface ContactDialogApi {
  openContact: (intent?: ContactIntent) => void;
}

// The no-op default lets sections render on their own (e.g. in unit tests).
const ContactDialogContext = createContext<ContactDialogApi>({ openContact: () => {} });

/** Owns the single contact dialog so any section can open it with a preset intent. */
export const ContactDialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{ open: boolean; intent: ContactIntent }>({ open: false, intent: "project" });
  const openContact = useCallback((intent: ContactIntent = "project") => setState({ open: true, intent }), []);
  const api = useMemo(() => ({ openContact }), [openContact]);
  return (
    <ContactDialogContext.Provider value={api}>
      {children}
      <ContactFormDialog
        open={state.open}
        intent={state.intent}
        onOpenChange={(open) => setState((s) => ({ ...s, open }))}
      />
    </ContactDialogContext.Provider>
  );
};

export const useContactDialog = () => useContext(ContactDialogContext);
