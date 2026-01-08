import React, { createContext, useContext } from 'react';

interface TabsContextType {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({ value: '', onValueChange: () => {} });

export const Tabs: React.FC<{ value: string; onValueChange: (val: string) => void; children: React.ReactNode }> = ({ value, onValueChange, children }) => {
    return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>;
};

export const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => 
    <div className={className}>{children}</div>;

export const TabsTrigger: React.FC<{ value: string; className?: string; disabled?: boolean; children: React.ReactNode }> = ({ value, className, children, disabled }) => {
    const { value: selectedValue, onValueChange } = useContext(TabsContext);
    const isActive = selectedValue === value;
    return (
        <button 
            onClick={() => !disabled && onValueChange(value)}
            data-state={isActive ? 'active' : 'inactive'}
            className={className}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export const TabsContent: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ value, className, children }) => {
    const { value: selectedValue } = useContext(TabsContext);
    if (selectedValue !== value) return null;
    return <div className={className}>{children}</div>;
};