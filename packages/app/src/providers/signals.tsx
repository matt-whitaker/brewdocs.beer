import {createContext, ReactNode, useContext} from "react";
import {Signals, signals as defaultSignals} from "@/signals";

const SignalsContext = createContext<Signals | null>(null);

export function SignalsProvider({signals = defaultSignals, children}: {signals?: Signals; children: ReactNode}) {
    return <SignalsContext.Provider value={signals}>{children}</SignalsContext.Provider>;
}

export function useSignals(): Signals {
    const signals = useContext(SignalsContext);
    if (!signals) throw new Error("useSignals requires a SignalsProvider");
    return signals;
}
